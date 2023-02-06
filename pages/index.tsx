import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Toolbar from '@/src/components/Toolbar/Toolbar';
import ColorDropper from '@/src/components/ColorDropper/ColorDropper';
import Canvas from '@/src/components/Canvas/Canvas';
import { buildHEXMatrixFromImageData, } from '@/src/utils';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HEX, HEXMatrix, Nullable, RGBA } from '@/src/types';
import useRelativeMousePosition from '@/src/hooks/useRelativeMousePosition';
import { buildColorMatrix, rgbaArrayToHex } from '@/src/utils';
import usePointingColor from '@/src/hooks/usePointingColor';

/// number of rows and cols the dropper grid will have.
const DROPPER_SIZE = 19;

// TODO: Separate the Home component a bit, right now it has LOTs of responsabilities
export default function Home() {
  // Reference to the canvas container div.
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  // A File representing an image
  const [imageFile, setImageFile] = useState<File | undefined>();

  // Boolean that controls the Toolbar's showDropper 
  const [showDropper, setShowDropper] = useState(false);
  // Boolean that controls the Toolbar's real image size setting 
  const [useImageSizeAsCanvasSize, setUseImageSizeAsCanvasSize] = useState(false);
  // Boolean that controls the Toolbar's transparency setting 
  const [useTransparency, setUseTransparency] = useState(false);

  // Sets `useTransparency` to true if we are using a png image
  useAutoUseTransparencyOnPNGImageFile(imageFile, setUseTransparency)

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stored ImageData of the canvas
  const [imageData, setImageData] = useState<ImageData | null>(null);

  // Tracks the position of the mouse when it's over the canvas container.
  const position = useRelativeMousePosition(containerRef);

  // An `Image` holding the data of the background image of the canvas.
  const canvasBackgroundImage = useBuildHTMLImageFromFile(imageFile);
  // Matrix of colors in hex format
  const clippedHexMatrix = useClipImageDataToDropperBounds(imageData, canvasRef.current, useTransparency);

  const handleFileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null && e.target.files.length > 0) {
      // TODO: should check if file is of image type
      setImageFile(e.target.files[0])
    }
  }

  /// The color in the middle of the colorMatrix, the one pointing with the mouse cursor.
  const pointingColor = usePointingColor(clippedHexMatrix);
  const _showDropper = showDropper && clippedHexMatrix != null && position != null;
  const hideCursorStyle = _showDropper ? { cursor: 'none' } : {};

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Color dropper coding challenge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={`${styles.content} ${styles.expanded}`}>
          <Toolbar
            colorPickerSelected={showDropper}
            color={_showDropper ? pointingColor : '--'}
            onColorPickerClick={() => setShowDropper(s => !s)}
            useTransparency={useTransparency}
            setUseTransparency={setUseTransparency}
            useImageSizeAsCanvasSize={useImageSizeAsCanvasSize}
            setUseImageSizeAsCanvasSize={setUseImageSizeAsCanvasSize}
          />
          <div ref={r => setContainerRef(r)} className={`${styles.canvasContainer} ${styles.expanded}`} style={hideCursorStyle}>
            {canvasBackgroundImage != null && <Canvas
              ref={canvasRef}
              image={canvasBackgroundImage}
              handleImageDataChange={setImageData}
              useImageSizeAsCanvasSize={useImageSizeAsCanvasSize}
              useTransparency={useTransparency}
            />}

            {_showDropper ? <ColorDropper
              pointingColor={pointingColor}
              hexColorMatrix={clippedHexMatrix}
              position={{ top: position.y, left: position.x }}
            /> : undefined
            }
          </div>
          <div>
            <input type="file" accept="image/png, image/jpeg" multiple={false} onChange={handleFileImageChange} />
          </div>
        </div>
      </main>
    </>
  )
}

// Creates a `Image` with the uploaded image file, or defaults to the beach image.
function useBuildHTMLImageFromFile(imageFile?: File): Nullable<HTMLImageElement> {
  const [image, setImage] = useState<Nullable<HTMLImageElement>>(null);
  useEffect(() => {
    const i = new Image()
    if (imageFile) {
      i.src = URL.createObjectURL(imageFile);
    } else {
      i.src = '../assets/background.jpg';
    }
    setImage(i);
  }, [imageFile]);
  return image;
}

// Automatically set transparency to true if uplaoded image is `png`
function useAutoUseTransparencyOnPNGImageFile(file: File | undefined, setUseTransparency: (t: boolean) => void) {
  const isPNG = useIsImageFilePNG(file);
  useEffect(() => {
    if (isPNG) {
      setUseTransparency(true);
    }
  }, [isPNG])
}

// Returns `true` if file is of type `png`
function useIsImageFilePNG(file: File | undefined) {
  const [isPNG, setIsPNG] = useState(false);
  useEffect(() => {
    if (file) {
      setIsPNG(file.type.endsWith('/png'))
    }
  }, [file, setIsPNG])

  return isPNG;
}


/**
 *  This hook is reponsible of generating the `ColorDropper`'s HexMatrix, using a ImageData as source
 *  NOTE: that operating over the ImageData is not strightforward, specially near the edges.
 *  Near an edge, since the sub-square of the ColorDropper might include values outside the image,
 *  see the ilustration below:
 * 
 *   ColorDropper area
 *          +---------+
 *          |.........|
 *          |...+ ----|-------- +
 *          |...|     |         |
 *          +---|-----+         | 
 *              |               |
 *              |  image data   |
 *              + ------------- +
 *
 *  In the example above the area in dots(.) doesn't exist in the ImageData. 
 */

function useClipImageDataToDropperBounds(imageData: Nullable<ImageData>, canvas: Nullable<HTMLCanvasElement>, useTransparency: boolean): Nullable<HEXMatrix> {
  const position = useRelativeMousePosition(canvas);

  return useMemo(() => {
    // The number of values that composes a pixel in the ImageData 
    // [r,g,b,a,r,g,b,a, ...] These are 2 pixels, but are represented in 8 values
    const flattenedRGBALength = 4;
    if (position != null && imageData != null) {

      // Number of pixels in a row of the ImageData
      const imageDataWidth = imageData.width;

      // Converts an (x,y) coord into the index position in the ImageData.
      const coordsToImageDataPosition = (_x: number, _y: number) => ((_y * imageDataWidth) + _x) * flattenedRGBALength;
      // Initialize the HexMatrix.
      const _matrix = buildColorMatrix<HEX>(DROPPER_SIZE, DROPPER_SIZE, '#00000000');
      const x = Math.round(position.x - (DROPPER_SIZE / 2)) || 0
      const y = Math.round(position.y - (DROPPER_SIZE / 2)) || 0

      // array reference of the iterative row we are adding the colors to.
      let jRow: HEX[] = [];
      // Temp matrix
      const hexMatrix: HEXMatrix['colors'] = [];
      // The top left pixel of the matrix converted in index position of the ImageData array
      const initialPos = coordsToImageDataPosition(x, y);
      // The bottom right pixel of the matrix converted in index position of the ImageData array
      const lastPos = coordsToImageDataPosition(x + DROPPER_SIZE - 1, y + DROPPER_SIZE - 1);
      // Number of values flattened pixels in a row.
      const rowLength = imageDataWidth * flattenedRGBALength;
      // Iterate over the 1D ImageData array of colors. In this loop we keep track of the
      // current row `jRow` and add `hex` values to it.
      // We increment the `i` value by `rowLength` and start at `initialPos` to avoid unnecesary iterations.
      for (let i = initialPos; i < lastPos; i += rowLength) {
        // Iterates through a row
        for (let j = i; j < (DROPPER_SIZE * flattenedRGBALength) + i; j += flattenedRGBALength) {
          // default value depending on the usage of trasparency
          let hex: HEX = useTransparency ? '#00000000' : '#000000';
          // boolean that checks if the j position is inside the ImageData array
          let isInsideVisibleVerticalBounds = j >= 0 && j + 3 < imageData.data.length;
          // Since ImageData is a 1D array of values, we need to check if the `j` position exist,
          // so we check the horizontal bounds
          let isInsideVisibleHorizontalBounds = j - i + (x * flattenedRGBALength) >= 0 && j - i + (x * flattenedRGBALength) < rowLength
          if (isInsideVisibleVerticalBounds && isInsideVisibleHorizontalBounds) {
            const rgba: RGBA = [imageData.data[j], imageData.data[j + 1], imageData.data[j + 2], imageData.data[j + 3]];
            if (!useTransparency) {
              rgba.splice(-1);
            }
            // converts the rgba array into a strig hex value
            hex = rgbaArrayToHex(rgba);
          }

          jRow.push(hex);
        }
        // Since we already create the current iterative row, we can add it to the matrix
        hexMatrix.push(jRow);
        // create a new reference to the iterative row. 
        jRow = [];
      }
      _matrix.colors = hexMatrix;
      return _matrix;
    }
    return null;

  }, [position, imageData, useTransparency])
}

import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Toolbar from '@/src/components/Toolbar/Toolbar';
import ColorDropper from '@/src/components/ColorDropper/ColorDropper';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HEX, HEXMatrix, Nullable, RGBA } from '@/src/types';
import useRelativeMousePosition from '@/src/hooks/useRelativeMousePosition';
import Canvas from '@/src/components/Canvas/Canvas';
import { buildColorMatrix, rgbaArrayToHex } from '@/src/utils';
import usePointingColor from '@/src/hooks/usePointingColor';
/// number of rows and cols the dropper grid will have.
const DROPPER_SIZE = 19;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  const [showDropper, setShowDropper] = useState(false);
  const [useImageSizeAsCanvasSize, setUseImageSizeAsCanvasSize] = useState(false);
  const [useTransparency, setUseTransparency] = useState(false);
  const [imageFile, setImageFile] = useState<File | undefined>();
  const isImageFilePNG = useIsImageFilePNG(imageFile);
  const [backgroundImage, _] = useSetBackgroundImage(imageFile);
  useAutoUseTransparencyOnPNGImageFile(isImageFilePNG, setUseTransparency);
  // const hexColorMatrix = useConvertRGBAMatrixToHexMatrix(colorMatrix, useTransparency);

  const handleRGBAMatrixChange = useCallback((d: ImageData) => {
    setImageData(d);
  }, [setImageData])

  /// Tracks the position of the mouse when it's over the canvas container.
  const position = useRelativeMousePosition(containerRef);
  // const clippedHexMatrix = useClipColorMatrixToDropperBounds(hexColorMatrix, canvasRef.current);

  // Matrix of colors in hex format
  const clippedHexMatrix = useClipImageDataToDropperBounds(imageData, canvasRef.current, useTransparency);

  const handleFileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    // handle validations
    if (e.target.files !== null && e.target.files.length > 0) {
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
            {backgroundImage != null && <Canvas
              ref={canvasRef}
              image={backgroundImage}
              handleImageDataChange={handleRGBAMatrixChange}
              useImageSizeAsCanvasSize={useImageSizeAsCanvasSize}
              useTransparency={useTransparency}
            />}
            {_showDropper ? <ColorDropper
              pointingColor={pointingColor}
              hexColorMatrix={clippedHexMatrix}
              position={{ top: position.y, left: position.x }}
            /> : undefined
            }
            {/* <Canvas ref={canvasRef} /> */}
          </div>
          <div>
            <input type="file" accept="image/png, image/jpeg" multiple={false} onChange={handleFileImageChange} />
          </div>
        </div>
      </main>
    </>
  )
}

// Creates a `Image` with the uploaded image file, or defaults to beach image.
function useSetBackgroundImage(imageFile?: File): [Nullable<HTMLImageElement>, (i: Nullable<HTMLImageElement>) => void] {
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
  return [image, setImage];
}

// Automatically set transparency to true if uplaoded image is `png`
function useAutoUseTransparencyOnPNGImageFile(isPNG: boolean, setUseTransparency: (t: boolean) => void) {
  useEffect(() => {
    if (isPNG) {
      setUseTransparency(true);
    }
  }, [isPNG])
}

function useIsImageFilePNG(file: File | undefined) {
  const [isPNG, setIsPNG] = useState(false);
  useEffect(() => {
    if (file) {
      setIsPNG(file.type.endsWith('/png'))
    }
  }, [file, setIsPNG])

  return isPNG;
}



function useClipImageDataToDropperBounds(imageData: Nullable<ImageData>, canvas: Nullable<HTMLCanvasElement>, useTransparency: boolean): Nullable<HEXMatrix> {
  const position = useRelativeMousePosition(canvas);

  return useMemo(() => {
    if (position != null && imageData != null) {


      const coordsToImageDataPosition = (_x: number, _y: number) => ((_y * imageDataWidth) + _x) * flattenedRGBALength;

      const _matrix = buildColorMatrix<HEX>(DROPPER_SIZE, DROPPER_SIZE, '#00000000');
      const flattenedRGBALength = 4;
      const x = Math.round(position.x - (DROPPER_SIZE / 2)) || 0
      const y = Math.round(position.y - (DROPPER_SIZE / 2)) || 0

      const imageDataWidth = imageData.width;
      // array reference of the iterative row we are adding the colors to.
      let jRow: HEX[] = [];
      const hexMatrix: HEXMatrix['colors'] = [];

      const initialPos = coordsToImageDataPosition(x, y);
      const lastPos = coordsToImageDataPosition(x + DROPPER_SIZE - 1, y + DROPPER_SIZE - 1);
      const rowLength = imageDataWidth * flattenedRGBALength;
      for (let i = initialPos; i < lastPos; i += rowLength) {
        for (let j = i; j < (DROPPER_SIZE * flattenedRGBALength) + i; j += flattenedRGBALength) {
          let hex: HEX = useTransparency ? '#00000000' : '#000000';
          let isImageDataPosOutofBounds = j >= 0 && j + 3 < imageData.data.length //&& j - rowLength < 0
          if (isImageDataPosOutofBounds) {
            const rgba: RGBA = [imageData.data[j], imageData.data[j + 1], imageData.data[j + 2], imageData.data[j + 3]];
            if (!useTransparency) {
              rgba.splice(-1);
            }
            hex = rgbaArrayToHex(rgba);
          }
          jRow.push(hex);
        }
        hexMatrix.push(jRow);
        jRow = [];
      }
      _matrix.colors = hexMatrix;
      // console.table(_matrix.colors)
      return _matrix;
    }
    return null;

  }, [position, imageData, useTransparency])



}

function useClipColorMatrixToDropperBounds(matrix: HEXMatrix, canvas: Nullable<HTMLCanvasElement>): HEXMatrix {
  const position = useRelativeMousePosition(canvas);

  return useMemo(() => {

    const _matrix = buildColorMatrix<HEX>(DROPPER_SIZE, DROPPER_SIZE, '#00000000');
    if (position != null && matrix != null) {
      const x = Math.round(position.x - (DROPPER_SIZE / 2)) || 0
      const y = Math.round(position.y - (DROPPER_SIZE / 2)) || 0
      for (let ni = 0; ni < DROPPER_SIZE; ni++) {
        for (let mi = 0; mi < DROPPER_SIZE; mi++) {
          if (mi + y < matrix.m && ni + x < matrix.n) {
            try {
              _matrix.colors[mi][ni] = matrix.colors[mi + y][ni + x];
            } catch (e) {
              debugger;
            }
          }
        }
      }
    }

    return _matrix;
  }, [position, matrix])

}

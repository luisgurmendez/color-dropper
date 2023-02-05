import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Toolbar from '@/src/components/Toolbar/Toolbar';
import ColorDropper from '@/src/components/ColorDropper/ColorDropper';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { HEXMatrix, Nullable } from '@/src/types';
import useRelativeMousePosition from '@/src/hooks/useRelativeMousePosition';
import Canvas from '@/src/components/Canvas/Canvas';
import { buildHEXMatrixFromImageData, } from '@/src/utils';
import usePointingColor from '@/src/hooks/usePointingColor';

/// number of rows and cols the dropper grid will have.
const DROPPER_SIZE = 19;

// TODO: Separate the Home component a bit, right now it has LOTs of responsabilities
export default function Home() {
  // Reference to the canvas container div.
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  // A File representing an image
  const [imageFile, setImageFile] = useState<File | undefined>();
  // A RGBAMatrix of size `DROPPER_SIZE` x `DROPPER_SIZE`
  const [hexColorMatrix, setHexColorMatrix] = useState<HEXMatrix | null>(null);

  // Boolean that controls the Toolbar's showDropper 
  const [showDropper, setShowDropper] = useState(false);
  // Boolean that controls the Toolbar's real image size setting 
  const [useImageSizeAsCanvasSize, setUseImageSizeAsCanvasSize] = useState(false);
  // Boolean that controls the Toolbar's transparency setting 
  const [useTransparency, setUseTransparency] = useState(false);

  // Sets `useTransparency` to true if we are using a png image
  useAutoUseTransparencyOnPNGImageFile(imageFile, setUseTransparency)

  // Builds a HexMatrix from an ImageData
  const handleImageDataChange = useCallback((imgData: ImageData) => {
    setHexColorMatrix(buildHEXMatrixFromImageData(imgData));
  }, [setHexColorMatrix, useTransparency])

  // Tracks the position of the mouse when it's over the canvas container.
  const position = useRelativeMousePosition(containerRef);

  // The color in the middle of the colorMatrix, the one pointing with the mouse cursor.
  const pointingColor = usePointingColor(hexColorMatrix);

  // An `Image` holding the data of the background image of the canvas.
  const canvasBackgroundImage = useBuildHTMLImageFromFile(imageFile);

  const handleFileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null && e.target.files.length > 0) {
      // TODO: should check if file is of image type
      setImageFile(e.target.files[0])
    }
  }

  const _showDropper = showDropper && hexColorMatrix != null && position != null;

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
              image={canvasBackgroundImage}
              onImageDataChange={handleImageDataChange}
              useImageSizeAsCanvasSize={useImageSizeAsCanvasSize}
              useTransparency={useTransparency}
              imageDataSize={DROPPER_SIZE}
            />}

            {_showDropper ? <ColorDropper
              pointingColor={pointingColor}
              hexColorMatrix={hexColorMatrix}
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
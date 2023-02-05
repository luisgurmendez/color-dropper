import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Toolbar from '@/src/components/Toolbar/Toolbar';
import ColorDropper from '@/src/components/ColorDropper/ColorDropper';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Nullable, RGBAMatrix } from '@/src/types';
import useRelativeMousePosition from '@/src/hooks/useRelativeMousePosition';
import Canvas from '@/src/components/Canvas/Canvas';
import { buildRGBAMatrixFromImageData, rgbaArrayToHex } from '@/src/utils';
import useConvertRGBAMatrixToHexMatrix from '@/src/hooks/useConvertRGBAMatrixToHEXMatrix';
import usePointingColor from '@/src/hooks/usePointingColor';

/// number of rows and cols the dropper grid will have.
const DROPPER_SIZE = 19;

export default function Home() {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [colorMatrix, setColorMatrix] = useState<RGBAMatrix | null>(null);
  const [showDropper, setShowDropper] = useState(false);
  const [useImageSizeAsCanvasSize, setUseImageSizeAsCanvasSize] = useState(false);
  const [useTransparency, setUseTransparency] = useState(false);
  const [imageFile, setImageFile] = useState<File | undefined>();
  const isImageFilePNG = useIsImageFilePNG(imageFile);
  const [backgroundImage, _] = useSetBackgroundImage(imageFile);
  useAutoUseTransparencyOnPNGImageFile(isImageFilePNG, setUseTransparency)

  const handleImageDataChange = useCallback((imgData: ImageData) => {
    setColorMatrix(buildRGBAMatrixFromImageData(imgData));
  }, [setColorMatrix])

  /// Tracks the position of the mouse when it's over the canvas container.
  const position = useRelativeMousePosition(containerRef);

  // Matrix of colors in hex format
  const hexColorMatrix = useConvertRGBAMatrixToHexMatrix(colorMatrix, useTransparency);

  const handleFileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    // handle validations
    if (e.target.files !== null && e.target.files.length > 0) {
      setImageFile(e.target.files[0])
    }
  }

  /// The color in the middle of the colorMatrix, the one pointing with the mouse cursor.
  const pointingColor = usePointingColor(hexColorMatrix);

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
            {backgroundImage != null && <Canvas
              image={backgroundImage}
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
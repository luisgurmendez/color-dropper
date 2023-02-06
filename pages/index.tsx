import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Toolbar from '@/src/components/Toolbar/Toolbar';
import ColorDropper from '@/src/components/ColorDropper/ColorDropper';
import Canvas from '@/src/components/Canvas/Canvas';
import { ChangeEvent, useRef, useState } from 'react';
import useRelativeMousePosition from '@/src/hooks/useRelativeMousePosition';
import usePointingColor from '@/src/hooks/usePointingColor';
import useAutoUseTransparencyOnPNGImageFile from '@/src/hooks/useAutoUseTransparencyOnPNGImageFile';
import useBuildHTMLImageFromFile from '@/src/hooks/useBuildHTMLImageFromFile';
import useBuildColorDropperHexMatrix from '@/src/hooks/useBuildColorDropperHexMatrix';

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
  // Reference of the canvas.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Stored ImageData of the canvas
  const [imageData, setImageData] = useState<ImageData | null>(null);
  // Tracks the position of the mouse when it's over the canvas container.
  const position = useRelativeMousePosition(containerRef);
  // An `Image` holding the data of the background image of the canvas.
  const canvasBackgroundImage = useBuildHTMLImageFromFile(imageFile);
  // Matrix of colors in hex format
  const clippedHexMatrix = useBuildColorDropperHexMatrix(imageData, canvasRef.current, useTransparency);

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


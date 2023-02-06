import { ForwardRefRenderFunction, forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Nullable } from "@/src/types";
import paintCanvasWhite from "@/src/hooks/usePaintCanvasWhite";

type ImageDataHanlder = (matrix: ImageData) => void;

interface CanvasProps {
    image: HTMLImageElement;
    useImageSizeAsCanvasSize: boolean;
    useTransparency: boolean;
    handleImageDataChange: ImageDataHanlder;

}

/**
 * Component responsible of rendering the canvas, drawing a background image and notify whenever
 * the ImageData of the canvas changes.
 */
const CanvasRefRenderFunction: ForwardRefRenderFunction<Nullable<HTMLCanvasElement>, CanvasProps> = ({
    image,
    handleImageDataChange,
    useImageSizeAsCanvasSize,
    useTransparency,
}, canvasRef) => {
    const [canvas, setCanvas] = useState<Nullable<HTMLCanvasElement>>(null);
    useImperativeHandle<Nullable<HTMLCanvasElement>, Nullable<HTMLCanvasElement>>(canvasRef, () => canvas, [canvas]);
    const handleResizeCanvas = useResizeCanvasToInitialParentElementSizeHandler(canvas)
    useSetInitialCanvasSize(handleResizeCanvas);
    useDrawBackgroundImage(canvas, image, handleResizeCanvas, handleImageDataChange, useImageSizeAsCanvasSize, useTransparency);

    return <canvas ref={setCanvas} />;
}

export const Canvas = forwardRef(CanvasRefRenderFunction);

// Draws a background image to the canvas, making it fit the current canvas size, or
// the image size depending on the `useImageSizeAsCanvasSize` value.
// It checks the size of the image so that we can draw it maximizing the space
// available in the canvas, using the best aspect ratio to fit the image.
function useDrawBackgroundImage(
    canvas: Nullable<HTMLCanvasElement>,
    image: HTMLImageElement,
    handleResizeCanvasToParent: () => void,
    handleImageDataChange: ImageDataHanlder,
    useImageSizeAsCanvasSize: boolean,
    useTransparency: boolean
) {
    const [hasImageLoaded, setHasImageLoaded] = useState(false);

    useEffect(() => {
        setHasImageLoaded(false);
        image.onload = () => setHasImageLoaded(true);
    }, [image])

    useEffect(() => {
        // This function is responsible of the actual drawing of the image. 
        // It also resizes the canvas accordingly depending on the `useImageAsCAnvasSize` value
        const drawBackgroundImage = () => {
            if (canvas != null) {
                handleResizeCanvasToParent();
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                if (ctx) {

                    // if we dont want transparency we paint the whole canvas white
                    if (!useTransparency) {
                        // Paints the whole cnvas white.
                        paintCanvasWhite(canvas)
                    }
                    if (useImageSizeAsCanvasSize) {
                        canvas.width = image.naturalWidth;
                        canvas.height = image.naturalHeight;
                        canvas.style.width = `${image.naturalWidth}px`
                        canvas.style.height = `${image.naturalHeight}px`
                        ctx.drawImage(image, 0, 0, image.width, image.height);
                    } else {
                        /// find the smallest ratio
                        const wRatio = canvas.width / image.width;
                        const hRatio = canvas.height / image.height;
                        const ratio = Math.min(wRatio, hRatio);

                        // Calculate the (x,y) of the sub rectangle origin where we are going to
                        // draw the image
                        const subRectangleOriginX = (canvas.width - image.width * ratio) / 2;
                        const subRectangleOriginY = (canvas.height - image.height * ratio) / 2;

                        // gets new size of image applying ratio
                        const resizedImageWidth = image.width * ratio;
                        const resizedImageHeight = image.height * ratio;

                        // Since the canvas size is != the image size, we will draw the image
                        // in a centered sub rectangle
                        ctx.drawImage(image, 0, 0, image.width, image.height,
                            subRectangleOriginX,
                            subRectangleOriginY,
                            resizedImageWidth,
                            resizedImageHeight);
                    }
                    if (canvas.width > 0 && canvas.height > 0) {
                        handleImageDataChange(ctx.getImageData(0, 0, canvas.width, canvas.height))
                    }
                }
            }
        }
        if (hasImageLoaded) {
            drawBackgroundImage();
        }
    }, [handleResizeCanvasToParent, hasImageLoaded, canvas, image, useImageSizeAsCanvasSize, useTransparency])
}


interface Size {
    w: number;
    h: number;
}

// Builds a function that sets the canvas width and height to the parent
// element initial size.
function useResizeCanvasToInitialParentElementSizeHandler(canvas: Nullable<HTMLCanvasElement>) {
    const [initialParentElementSize, setInitialParentElementSize] = useState<Nullable<Size>>(null)
    useEffect(() => {
        if (canvas !== null && canvas.parentElement != null) {
            if (initialParentElementSize == null) {
                const rect = canvas.parentElement.getBoundingClientRect();
                setInitialParentElementSize({ w: rect.width, h: rect.height });
            }
        }
    }, [canvas, setInitialParentElementSize])

    // function that sets the canvas size.
    const handleResizeCanvas = useCallback(() => {
        if (canvas != null) {
            if (canvas.parentElement != null) {
                if (initialParentElementSize != null) {
                    canvas.width = initialParentElementSize.w;
                    canvas.height = initialParentElementSize.h;
                    canvas.style.width = `${initialParentElementSize.w}px`
                    canvas.style.height = `${initialParentElementSize.h}px`
                }


            }
        }
    }, [canvas, initialParentElementSize]);

    return handleResizeCanvas;
}

// Sets the initial canvas size, so that it fits it's parent HTMLElement.
// This logic could be a little bit more complex so that it reacts to window resize events, but
// for the sake of this challenge I didn't add that.
function useSetInitialCanvasSize(handleResize: () => void) {
    // Sets initial canvas size;
    useEffect(handleResize, [handleResize]);
}

export default Canvas;

import { ForwardRefRenderFunction, ForwardedRef, Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import useRelativeMousePosition from "../../hooks/useRelativeMousePosition";
import { Nullable, RGBAMatrix } from "@/src/types";
import paintCanvasWhite from "@/src/hooks/usePaintCanvasWhite";
import { buildRGBAMatrixFromImageData } from "@/src/utils";

interface CanvasProps {
    image: HTMLImageElement;
    useImageSizeAsCanvasSize: boolean;
    useTransparency: boolean;
    onRGBAMatrixChange: RGBAMatrixHanlder;
}


const CanvasRefRenderFunction: ForwardRefRenderFunction<Nullable<HTMLCanvasElement>, CanvasProps> = ({
    image,
    onRGBAMatrixChange,
    useImageSizeAsCanvasSize,
    useTransparency,
}, canvasRef) => {
    const [canvas, setCanvas] = useState<Nullable<HTMLCanvasElement>>(null);
    useImperativeHandle<Nullable<HTMLCanvasElement>, Nullable<HTMLCanvasElement>>(canvasRef, () => canvas, [canvas]);
    const handleResizeCanvas = useResizeCanvasToInitialParentElementSizeHandler(canvas)
    useSetInitialCanvasSize(handleResizeCanvas);
    useDrawBackgroundImage(canvas, image, handleResizeCanvas, onRGBAMatrixChange, useImageSizeAsCanvasSize, useTransparency);

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
    handleRGBAMatrixChange: RGBAMatrixHanlder,
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
                const ctx = canvas.getContext('2d');

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
                    handleRGBAMatrixChange(buildRGBAMatrixFromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height)))
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

type RGBAMatrixHanlder = (matrix: RGBAMatrix) => void;

export default Canvas;

function useBuildRGBAMatrix(canvas: Nullable<HTMLCanvasElement>, onRGBAMatrix: RGBAMatrixHanlder) {
    const ctx = useCanvasContext(canvas);
    useEffect(() => {
        if (canvas && ctx) {
            onRGBAMatrix(buildRGBAMatrixFromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height)))
        }
    }, [ctx, canvas])
}

function useCanvasContext(canvas: Nullable<HTMLCanvasElement>) {
    return useMemo(() => canvas?.getContext('2d', { willReadFrequently: true }), [canvas]);
}


// Ideally this logic should "live" in a parent component, 
// and let the `Canvas` component forward the canvas ref to follow single responsability 
// principles, I didn't do so for the sake of simplicity.
// function useBuildImageDataOnMouseMove(canvas: Nullable<HTMLCanvasElement>, onImageData: ImageDataHanlder, imageSize: number) {
//     const ctx = useCanvasContext(canvas);
//     // Gets the relative position of the mouse inside the canvas element.
//     const relativeMousePosition = useRelativeMousePosition(canvas);

//     // Whenever the position of the mouse relative to the canvas changes, we want to
//     // build a new `ImageData`.
//     useEffect(() => {
//         if (relativeMousePosition != null && ctx != null) {
//             if (ctx) {
//                 // creates an `ImageData` of a square surrounding the mouse cursor.
//                 const imageData = ctx.getImageData(
//                     relativeMousePosition.x - ((imageSize - 1) / 2),
//                     relativeMousePosition.y - ((imageSize - 1) / 2),
//                     imageSize,
//                     imageSize
//                 );
//                 onImageData(imageData);
//             }
//         }

//     }, [ctx, imageSize, relativeMousePosition])
// }
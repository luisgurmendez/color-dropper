import { RGB, RGBA, RGBAMatrix } from "./types";


/**
 * Converts a [r, g, b, a] array representinga a RGBA color, to a hex color.
 * 
 * rgbaArrayToHex([255,255,255,255]) -> #FFFFFFFF
 */
export const rgbaArrayToHex = (rgba: RGBA | RGB): string => {
    const rgbaH = rgba.map(c => {
        let h = c.toString(16)
        if (h.length == 1) h = "0" + h;
        return h
    })
    return `#${rgbaH.join('')}`
}

/**
 * Builds a `RGBAMatrix` from a `ImageData`
**/
export const buildRGBAMatrixFromImageData = (imageData: ImageData): RGBAMatrix => {
    const flattenedRGBALength = 4;
    const imageDataWidth = imageData.width;
    // array reference of the iterative row we are adding the colors to.
    let jRow: RGBA[] = [];
    const rgbaMatrix: RGBAMatrix['colors'] = [];
    for (let i = 0; i < imageData.data.length; i += flattenedRGBALength) {
        const rgba: RGBA = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]];
        if (i % (imageDataWidth * 4) === 0) {
            // creates a new row
            jRow = [];
            rgbaMatrix.push(jRow);
        }
        jRow.push(rgba);
    }

    return {
        n: imageDataWidth,
        m: rgbaMatrix.length,
        colors: rgbaMatrix
    }
};

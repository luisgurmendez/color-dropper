import { ColorMatrix, HEX, HEXMatrix, RGB, RGBA, RGBAMatrix, RGBAOrRGBMatrix, isRGBA } from "./types";

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


/**
 * Builds a `RGBAMatrix` from a `ImageData`
**/
export const buildHEXMatrixFromImageData = (imageData: ImageData): HEXMatrix => {
    const flattenedRGBALength = 4;
    const imageDataWidth = imageData.width;
    // array reference of the iterative row we are adding the colors to.
    let jRow: HEX[] = [];
    const rgbaMatrix: HEXMatrix['colors'] = [];
    for (let i = 0; i < imageData.data.length; i += flattenedRGBALength) {
        const hex: HEX = rgbaArrayToHex([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]]);
        if (i % (imageDataWidth * 4) === 0) {
            // creates a new row
            jRow = [];
            rgbaMatrix.push(jRow);
        }
        jRow.push(hex);
    }

    return {
        n: imageDataWidth,
        m: rgbaMatrix.length,
        colors: rgbaMatrix
    }
};


export const convertRGBAMatrixToHexMatrix = (matrix: RGBAOrRGBMatrix, useTransparency: boolean): HEXMatrix => {
    const hexMatrix: HEXMatrix = {
        n: matrix.n,
        m: matrix.m,
        /// initialize a new matrix nxm with black hex colors
        colors: Array(matrix.m).fill("empty").map(() => Array(matrix.n).fill("#000"))
    }

    for (let ni = 0; ni < matrix.n; ni++) {
        for (let mi = 0; mi < matrix.n; mi++) {
            const rgba = matrix.colors[mi][ni]
            // removes the alpha value
            if (isRGBA(rgba) && !useTransparency) {
                rgba.splice(-1);
            }
            // adds the color in hex format to the matrix.
            hexMatrix.colors[mi][ni] = rgbaArrayToHex(rgba);
        }
    }
    return hexMatrix;
}

export const buildColorMatrix = <C>(n: number, m: number, defaultColor: C) => {
    const _matrix: ColorMatrix<C> = {
        n: n,
        m: m,
        /// initialize a new matrix nxm with black hex colors
        colors: Array(m).fill("empty").map(() => Array(n).fill(defaultColor))
    }
    return _matrix;
}
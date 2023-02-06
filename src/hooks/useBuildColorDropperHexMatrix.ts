import { useMemo, } from 'react';
import { HEX, HEXMatrix, Nullable, Position, RGBA } from '../types';
import useRelativeMousePosition from './useRelativeMousePosition';
import { buildColorMatrix, rgbaArrayToHex } from '../utils';
import { DROPPER_SIZE } from '../constants';

const flattenedRGBALength = 4;

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

function useBuildColorDropperHexMatrix(imageData: Nullable<ImageData>, canvas: Nullable<HTMLCanvasElement>, useTransparency: boolean): Nullable<HEXMatrix> {
    const position = useRelativeMousePosition(canvas);

    return useMemo(() => {
        // The number of values that composes a pixel in the ImageData 
        // [r,g,b,a,r,g,b,a, ...] These are 2 pixels, but are represented in 8 values

        if (position != null && imageData != null) {

            // Number of pixels in a row of the ImageData
            const imageDataWidth = imageData.width;

            // The top left coordinate of where the dropper should start.
            const dropperX = Math.round(position.x - (DROPPER_SIZE / 2)) || 0
            const dropperY = Math.round(position.y - (DROPPER_SIZE / 2)) || 0

            const dropperPosition: Position = { x: dropperX, y: dropperY };

            // Initialize the HexMatrix.
            const _matrix = buildColorMatrix<HEX>(DROPPER_SIZE, DROPPER_SIZE, '#00000000');
            // Builds a `Hex[][]` matrix using the droppers position and the image data as source.
            _matrix.colors = buildHexMatrixColors(dropperPosition, imageData.data, imageDataWidth, useTransparency);

            return _matrix;
        }
        return null;

    }, [position, imageData, useTransparency])
}


export default useBuildColorDropperHexMatrix;

// This is where the "magic" happends, and more complex logic lives. 
// For testing purposes I abstracted and export this function so that the whole hook is easier 
// to test.
export function buildHexMatrixColors(dropperPosition: Position, data: Uint8ClampedArray, rowWidth: number, useTransparency: boolean): HEXMatrix['colors'] {
    // Number of values flattened pixels in a row.
    const rowLength = rowWidth * flattenedRGBALength;

    // array reference of the iterative row we are adding the colors to.
    let jRow: HEX[] = [];
    // Temp matrix
    const hexMatrix: HEXMatrix['colors'] = [];
    // The top left pixel of the matrix converted in index position of the ImageData array
    const initialPos = coordsToImageDataPosition(dropperPosition.x, dropperPosition.y, rowWidth);
    // The bottom right pixel of the matrix converted in index position of the ImageData array
    const lastPos = coordsToImageDataPosition(dropperPosition.x + DROPPER_SIZE - 1, dropperPosition.y + DROPPER_SIZE - 1, rowWidth);

    // Iterate over the 1D ImageData array of colors. In this loop we keep track of the
    // current row `jRow` and add `hex` values to it.
    // We increment the `i` value by `rowLength` and start at `initialPos` to avoid unnecesary iterations.

    for (let i = initialPos; i < lastPos; i += rowLength) {
        // Iterates through a row
        for (let j = i; j < (DROPPER_SIZE * flattenedRGBALength) + i; j += flattenedRGBALength) {
            // default value depending on the usage of trasparency
            let hex: HEX = useTransparency ? '#00000000' : '#000000';
            // boolean that checks if the j position is inside the ImageData array
            let isInsideVisibleVerticalBounds = j >= 0 && j + 3 < data.length;
            // Since ImageData is a 1D array of values, we need to check if the `j` position exist,
            // so we check the horizontal bounds
            let isInsideVisibleHorizontalBounds = j - i + (dropperPosition.x * flattenedRGBALength) >= 0 && j - i + (dropperPosition.x * flattenedRGBALength) < rowLength
            if (isInsideVisibleVerticalBounds && isInsideVisibleHorizontalBounds) {
                const rgba: RGBA = [data[j], data[j + 1], data[j + 2], data[j + 3]];
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

    return hexMatrix;
}


const coordsToImageDataPosition = (x: number, y: number, width: number) => ((y * width) + x) * flattenedRGBALength;
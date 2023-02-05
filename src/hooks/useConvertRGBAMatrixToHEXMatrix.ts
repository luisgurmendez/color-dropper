import { useMemo } from "react";
import { HEXMatrix, Nullable, RGBAOrRGBMatrix, isRGBA } from "../types";
import { rgbaArrayToHex } from "../utils";

// Converts an RGBAMatrix to a HexMatrix.
function useConvertRGBAMatrixToHexMatrix(matrix: Nullable<RGBAOrRGBMatrix>, useTransparency: boolean = false): Nullable<HEXMatrix> {
    return useMemo(() => {
        if (matrix != null) {

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
        return null;
    }, [matrix]);

}

export default useConvertRGBAMatrixToHexMatrix;
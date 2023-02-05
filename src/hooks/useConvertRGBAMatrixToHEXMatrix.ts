import { useMemo } from "react";
import { HEX, HEXMatrix, Nullable, RGB, RGBA, RGBAOrRGBMatrix, isRGBA } from "../types";
import { buildColorMatrix, rgbaArrayToHex } from "../utils";

// Converts an RGBAMatrix to a HexMatrix.
function useConvertRGBAMatrixToHexMatrix(matrix: Nullable<RGBAOrRGBMatrix>, useTransparency: boolean = false): Nullable<HEXMatrix> {
    return useMemo(() => {
        if (matrix != null) {
            const hexMatrix = buildColorMatrix<HEX>(matrix.n, matrix.m, '#00000000');

            for (let ni = 0; ni < matrix.n; ni++) {
                for (let mi = 0; mi < matrix.m; mi++) {
                    const rgba = [...matrix.colors[mi][ni]] as (RGBA | RGB)

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
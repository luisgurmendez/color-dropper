import { useMemo } from "react";
import { HEXMatrix, Nullable } from "../types";

class EvenMatrixError extends Error {
    constructor() {
        super('The matrix is not odd, so its not possible to determine the middle point');
    }
};

// Gets the center color of a odd sized HexMatrix
function usePointingColor(colorMatrix: Nullable<HEXMatrix>): string {
    return useMemo(() => {
        if (colorMatrix != null) {
            if (colorMatrix.n % 2 == 0 || colorMatrix.m % 2 == 0) {
                throw new EvenMatrixError();
            }
            return colorMatrix.colors[(colorMatrix.m - 1) / 2][(colorMatrix.n - 1) / 2].toUpperCase();
        }
        return '#FFF';
    }, [colorMatrix]);
}

export default usePointingColor;

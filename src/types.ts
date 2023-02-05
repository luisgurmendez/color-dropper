

/// array representation of a rgba value.
export type RGBA = [number, number, number, number];
/// array representation of a rgb value.
export type RGB = [number, number, number];
// representation of a color in hex
export type HEX = string;

export function isRGBA(rgba: any): rgba is RGBA {
    // For the purpose of this challenge we can assume that it's values are all numbers.
    return rgba != null && Array.isArray(rgba) && rgba.length === 4;
}

export function isRGB(rgb: any): rgb is RGBA {
    // For the purpose of this challenge we can assume that it's values are all numbers.
    return rgb != null && Array.isArray(rgb) && rgb.length === 3;
}

export type ColorRepresentation = RGB | RGBA | HEX;

/**
 * Representation of a matrix where it's values represent a color
 *            n
 *    + ------------- +
 *    |               |
 *    |               |
 *    |               |  m
 *    |               |
 *    |               |
 *    + ------------- +
 */
export interface ColorMatrix<ColorRepresentation> {
    colors: ColorRepresentation[][];
    n: number;
    m: number;
}

export type RGBAOrRGBMatrix = ColorMatrix<RGBA | RGB>;
export type RGBAMatrix = ColorMatrix<RGBA>;
export type RGBMatrix = ColorMatrix<RGB>;
export type HEXMatrix = ColorMatrix<HEX>;

export interface Position {
    x: number;
    y: number;
}

export type Nullable<T> = T | null;

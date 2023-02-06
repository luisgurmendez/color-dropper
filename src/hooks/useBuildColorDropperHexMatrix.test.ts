
import { buildHexMatrixColors } from './useBuildColorDropperHexMatrix'

const data = new Uint8ClampedArray([
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255,
    255, 0, 0, 255
]); // 4x4 data representing a red ImageData

const DATA_ROW_WIDTH = 4;

jest.mock('../constants', () => ({
    get DROPPER_SIZE() {
        return 3;
    },
}));


test('should return a 3x3 red color matrix', () => {
    const hexColors = buildHexMatrixColors({ x: 0, y: 0 }, data, DATA_ROW_WIDTH, false);
    expect(hexColors).toStrictEqual([
        ['#ff0000', '#ff0000', '#ff0000'],
        ['#ff0000', '#ff0000', '#ff0000'],
        ['#ff0000', '#ff0000', '#ff0000']
    ])
})

test('should return a 3x3 red color matrix with transparency', () => {
    const hexColors = buildHexMatrixColors({ x: 0, y: 0 }, data, DATA_ROW_WIDTH, true);
    expect(hexColors).toStrictEqual([
        ['#ff0000ff', '#ff0000ff', '#ff0000ff'],
        ['#ff0000ff', '#ff0000ff', '#ff0000ff'],
        ['#ff0000ff', '#ff0000ff', '#ff0000ff']
    ])
})


// Just the bottom right pixel should have a value
test('should return most of its values transparent since we are going off canvas', () => {
    const hexColors = buildHexMatrixColors({ x: -2, y: -2 }, data, DATA_ROW_WIDTH, false);
    expect(hexColors).toStrictEqual([
        ['#000000', '#000000', '#000000'],
        ['#000000', '#000000', '#000000'],
        ['#000000', '#000000', '#ff0000']
    ])
})


// Just the top left pixel should have a value
test('should return most of its values transparent since we are going off canvas but from the bottom right corner', () => {
    const hexColors = buildHexMatrixColors({ x: DATA_ROW_WIDTH - 1, y: DATA_ROW_WIDTH - 1 }, data, DATA_ROW_WIDTH, false);
    expect(hexColors).toStrictEqual([
        ['#ff0000', '#000000', '#000000'],
        ['#000000', '#000000', '#000000'],
        ['#000000', '#000000', '#000000']
    ])
})


test('should return a 3x3 of black color matrix since we are going off canvas totally', () => {
    const hexColors = buildHexMatrixColors({ x: -10, y: -10 }, data, DATA_ROW_WIDTH, false);
    expect(hexColors).toStrictEqual([
        ['#000000', '#000000', '#000000'],
        ['#000000', '#000000', '#000000'],
        ['#000000', '#000000', '#000000']
    ])
})
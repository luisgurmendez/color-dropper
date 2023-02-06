import { HEX, HEXMatrix, Position } from "../../types";
import styles from './ColorDropper.module.css';

interface ColorDropperProps {
    // odd numbered matrix of hex colors.
    hexColorMatrix: HEXMatrix;
    // the position where we should position this element.
    // NOTE, that this position is the actual center of the `ColorDropper` so when setting the
    // position we should substract the size/2 of itself to center it correctly, we do this
    // using css.
    position: Position;
    // The center color of the grid.
    pointingColor: HEX;
}

// Uses the `hexColorMatrix` to build a grid of colors. 
// It uses `<div>`s to create the grid, this could have performance implications if the grid 
// is too large, in that case, we can explore drawing the whole ColorDropper in a canvas.
// The central square of the grid is slightly different, so that the user can easily identify
// the `pointingColor`. Here we assume the `hexColorMatrix` has an odd number of rows & cols.
const ColorDropper: React.FC<ColorDropperProps> = ({ hexColorMatrix, position, pointingColor }) => {
    return (
        <div className={styles.container} style={{ left: position.x, top: position.y }}>
            <div
                className={styles.changableColorContainer}
                style={{ borderColor: pointingColor }}
            >
                <div className={styles.containerInner}>
                    {hexColorMatrix.colors.map((columnArray: any, mi: number) => (
                        <div key={mi} className={styles.gridContainer}>
                            {columnArray.map((color: string, ni: number) => {
                                const isCenteralGridItem = ni === (hexColorMatrix.n - 1) / 2 && mi === (hexColorMatrix.m - 1) / 2;
                                const centerGridItemStyles = isCenteralGridItem ? styles.centerGridItem : ''
                                return (
                                    <div
                                        key={ni}
                                        className={`${styles.gridItem} ${centerGridItemStyles}`}
                                        style={{
                                            background: color,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ))}

                    <span className={styles.colorHexContainer}>
                        {pointingColor.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ColorDropper;


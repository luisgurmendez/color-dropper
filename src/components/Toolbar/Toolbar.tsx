import { ChangeEvent, ChangeEventHandler, useCallback } from "react";
import IconColorPicker from "./IconColorPicker"
import styles from './Toolbar.module.css'


type BooleanSetter = (v: boolean) => void;

interface ToolbarProps {
    onColorPickerClick: () => void;
    color: string | undefined;
    colorPickerSelected: boolean;
    useTransparency: boolean;
    setUseTransparency: BooleanSetter;
    useImageSizeAsCanvasSize: boolean;
    setUseImageSizeAsCanvasSize: BooleanSetter;
}

const Toolbar: React.FC<ToolbarProps> = ({
    colorPickerSelected,
    color,
    onColorPickerClick,
    useTransparency,
    useImageSizeAsCanvasSize,
    setUseTransparency,
    setUseImageSizeAsCanvasSize
}) => {
    const handleTransparencyToggle = useOnChangeEventHandlerWrapper(setUseTransparency);
    const handleImageSizeToggle = useOnChangeEventHandlerWrapper(setUseImageSizeAsCanvasSize);

    return (
        <div className={`${styles.tools}`}>
            <div className={styles.primaryTools}>
                <IconColorPicker selected={colorPickerSelected} onClick={onColorPickerClick} />
                <div className={styles.imageSizeInput}>
                    <span>Use real image size: </span>
                    <input
                        onChange={handleImageSizeToggle}
                        checked={useImageSizeAsCanvasSize}
                        type={"checkbox"}
                    />
                </div>
                <div className={styles.imageSizeInput}>
                    <span>Use transparency: </span>
                    <input
                        onChange={handleTransparencyToggle}
                        checked={useTransparency}
                        type={"checkbox"}
                    />
                </div>
            </div>
            <div>
                <strong>{color}</strong>
            </div>
            <div />
        </div>
    )
}

export default Toolbar;


function useOnChangeEventHandlerWrapper(setter: BooleanSetter) {
    const wrapper = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setter(event.target.checked);
    }, [setter])
    return wrapper;
}
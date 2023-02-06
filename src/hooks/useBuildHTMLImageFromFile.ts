import { useEffect, useState } from "react";
import { Nullable } from "../types";

// Creates a `Image` with the uploaded image file, or defaults to the beach image.
function useBuildHTMLImageFromFile(imageFile?: File): Nullable<HTMLImageElement> {
    const [image, setImage] = useState<Nullable<HTMLImageElement>>(null);
    useEffect(() => {
        const i = new Image()
        if (imageFile) {
            i.src = URL.createObjectURL(imageFile);
        } else {
            i.src = '../assets/background.jpg';
        }
        setImage(i);
    }, [imageFile]);
    return image;
}


export default useBuildHTMLImageFromFile;

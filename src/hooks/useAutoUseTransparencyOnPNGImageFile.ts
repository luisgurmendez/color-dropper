import { useEffect, useState } from "react";

// Automatically set transparency to true if uplaoded image is `png`
function useAutoUseTransparencyOnPNGImageFile(file: File | undefined, setUseTransparency: (t: boolean) => void) {
    const isPNG = useIsImageFilePNG(file);
    useEffect(() => {
        if (isPNG) {
            setUseTransparency(true);
        }
    }, [isPNG])
}

// Returns `true` if file is of type `png`
function useIsImageFilePNG(file: File | undefined) {
    const [isPNG, setIsPNG] = useState(false);
    useEffect(() => {
        if (file) {
            setIsPNG(file.type.endsWith('/png'))
        }
    }, [file, setIsPNG])

    return isPNG;
}

export default useAutoUseTransparencyOnPNGImageFile;
import { useCallback, useEffect, useState } from "react";
import { Position } from "../types";

/**
 *  Stores the relative position of the mouse inside a HTML element, using the top left
 *  corner of the element as the origin (0,0).
 *  If the mouse leaves the element it returns `null`
 * 
 *    (0,0) 
 *       + ------------- +
 *       |   .           |
 *       |   (x,y)       |
 *       |               |
 *       + ------------- +
 * 
 */
function useRelativeMousePosition(container: HTMLElement | null): Position | null {
    const [position, setPosition] = useState<Position | null>(null);

    // Sets the new relative position whenever the mouse moves
    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (container !== null) {
            const rect = container.getBoundingClientRect();
            const { clientX, clientY } = event;
            const position = { x: clientX - rect.x, y: clientY - rect.y };
            setPosition(position)
        }
    }, [container])

    // if the mouse leaves the element we set the position as `null`
    const handleMouseLeave = useCallback((_: MouseEvent) => {
        setPosition(null)
    }, [])

    // Listen to mouse events.
    useEffect(() => {
        container?.addEventListener("mousemove", handleMouseMove);
        container?.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            container?.removeEventListener("mousemove", handleMouseMove);
            container?.removeEventListener("mouseleave", handleMouseLeave);

        }
    }, [container, handleMouseMove]);

    return position;
}


export default useRelativeMousePosition;

// Paints the canvas white
function paintCanvasWhite(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // clear the canvas before drawing the background img.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // We first fill the canvas in white so that when the mouse is outside the
        // drawn image bounds we get a white color instead of a transparent.
        ctx.save()
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

export default paintCanvasWhite;


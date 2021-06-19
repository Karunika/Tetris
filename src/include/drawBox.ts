export default function drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) : void{
    ctx.fillStyle = color;
    ctx.fillRect(x*size, y*size, size, size);
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "white";
    ctx.strokeRect(x*size, y*size, size, size);
};
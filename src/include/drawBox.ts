// interface IHash {
//     [details: string] : any;
// } 

// const box: IHash = {
//     "black" : require('../assets/black.png'),
//     "blue" : require('../assets/blue.png'),
//     "cyan" : require('../assets/cyan.png'),
//     "green" : require('../assets/green.png'),
//     "orange" : require('../assets/orange.png'),
//     "purple" : require('../assets/purple.png'),
//     "red" : require('../assets/red.png'),
//     "yellow" : require('../assets/yellow.png')
// }
// let piece = new Image();

// export default function drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) : void{
//     if(color == `black`){
//         ctx.fillStyle = `rgb(26,26,26)`;
//         ctx.fillRect(x*size, y*size, size, size);
//         ctx.lineWidth = 0.1;
//         ctx.strokeStyle = "white";
//         ctx.strokeRect(x*size, y*size, size, size);
//     }else{
//         let c = box[color].replace(/^public/, "");
//         piece.src = c;
//         ctx.drawImage(piece, x*size, y*size, size, size);
//     }
// };
interface IHash {
    [details: string] : any;
} 

const box: IHash = {
    "black" : require('../assets/black.png'),
    "blue" : require('../assets/blue.png'),
    "cyan" : require('../assets/cyan.png'),
    "green" : require('../assets/green.png'),
    "orange" : require('../assets/orange.png'),
    "purple" : require('../assets/purple.png'),
    "red" : require('../assets/red.png'),
    "yellow" : require('../assets/yellow.png')
}
for(let c in box){
    let boxImg = new Image();
    box[c] = box[c].replace(/^public/, "")
    boxImg.src = box[c];
    box[c] = boxImg;
}

export default function drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) : void{
    if(color == `black`){
        ctx.fillStyle = `rgb(26,26,26)`;
        ctx.fillRect(x*size, y*size, size, size);
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = "white";
        ctx.strokeRect(x*size, y*size, size, size);
    }else{
        ctx.drawImage(box[color], x*size, y*size, size, size);
    }
};
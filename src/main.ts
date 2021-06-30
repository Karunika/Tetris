import Game from "./include/Game";
import { I_UIDOM, I_StatsBoard } from "./include/UIDOM"
import config from "./config";

const mainCanvas = document.querySelector('canvas.main')! as HTMLCanvasElement;
const nextCanvas = document.querySelector('canvas.next')! as HTMLCanvasElement;
const holdCanvas = document.querySelector('canvas.hold')! as HTMLCanvasElement;
const timer = document.querySelector('span.timer-display')! as HTMLSpanElement;
const linesCleared = document.querySelector('span.lines-cleared-display')! as HTMLSpanElement;

const statsBoardSelections: I_StatsBoard = {
    timer,
    linesCleared
}

const UIDOMSelections: I_UIDOM = {
    mainCanvas,
    nextCanvas,
    holdCanvas,
    statsBoard: statsBoardSelections
}

const startBtn = document.querySelector('button.start')! as HTMLDivElement;
let game: Game = new Game(UIDOMSelections, config.COLUMNS, config.ROWS, config.SIZE);
startBtn.addEventListener(`click`, () => {
    if(!game.running){
        game.startGame();
    }
});

enum GameControls {
    LEFT = 37,
    UP = 38,
    RIGHT = 39,
    DOWN = 40,
    SPACE = 32,
    Z = 90,
    A = 65,
    C = 67
}
document.addEventListener('keydown', e => {
    if(!game.running){
        return;
    }
    const { LEFT, UP, RIGHT, DOWN, SPACE, Z, A, C } = GameControls;
    switch(e.keyCode){
        case LEFT:
            game.activeTetrimino.erase().moveLeft().render();
            game.activeTetrimino.resetLockdownTimer();
            break;
        case UP:
            game.activeTetrimino.erase().rotateRight().render();
            game.activeTetrimino.resetLockdownTimer();
            break;
        case RIGHT:
            game.activeTetrimino.erase().moveRight().render();
            game.activeTetrimino.resetLockdownTimer();
            break;
        case DOWN:
            game.activeTetrimino.setSoftDropMode(true);
            break;
        case SPACE:
            game.activeTetrimino.hardDrop();
            break;
        case Z:
            game.activeTetrimino.erase().rotateLeft().render();
            game.activeTetrimino.resetLockdownTimer();
            break;
        case A:
            game.activeTetrimino.erase().rotate180().render();
            game.activeTetrimino.resetLockdownTimer();
            break;
        case C:
            game.holdTetrimino();
            break;
    }
    if(game.activeTetrimino?.lockdownTimer == undefined){
        game.activeGhostTetrimino.erase().setProjection(game.activeTetrimino).render();
    }

});
document.addEventListener('keyup', e => {
    if(!game){
        return;
    }
    const { DOWN } = GameControls; 
    switch(e.keyCode){
        case DOWN:
            game.activeTetrimino.setSoftDropMode(false);
            break;
    }
});
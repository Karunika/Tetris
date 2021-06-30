import drawBox from "./drawBox";
import { Unit, data } from "../Tetriminoes"
import { I_UIDOM } from "./UIDOM"
import Tetrimino from "./Tetrimino";

function genRandUnit() : Unit{
    return Math.ceil(Math.random()*7);
};

export default class Game {
    UIDOM: I_UIDOM;
    ctx!: CanvasRenderingContext2D;
    nextCtx!: CanvasRenderingContext2D;
    holdCtx!: CanvasRenderingContext2D;

    readonly columns: number;
    readonly rows: number;
    readonly size: number;

    activeTetrimino!: Tetrimino;
    activeGhostTetrimino!: Tetrimino;
    activeTetriminoUnit!: Unit;
    nextTetriminoUnits: Unit[] = [];
    tetriminoOnHoldUnit: undefined | Unit = undefined;
    gridMatrix: Unit[][] = [];
    timer!: NodeJS.Timer;
    linesCleared: number;
    holdingDisabled: boolean = false;
    running: boolean = false;

    static readonly NEXT_TETRIMINOES_COUNT: number = 4;
    static readonly VACANT: string = `black`;

    constructor(UIDOM: I_UIDOM, columns: number, rows: number, size: number){
        this.UIDOM = UIDOM;
        this.columns = columns;
        this.rows = rows;
        this.size = size;
        this.linesCleared = 0;
        
        this.mountAllCanvas();
    };
    mountMainCanvas() : void{
        this.UIDOM.mainCanvas.width = this.columns*this.size;
        this.UIDOM.mainCanvas.height = this.rows*this.size;
        this.ctx = this.UIDOM.mainCanvas.getContext(`2d`)! as CanvasRenderingContext2D;
    };
    mountHoldCanvas() : void{
        this.UIDOM.holdCanvas.width = 6*this.size;
        this.UIDOM.holdCanvas.height = 6*this.size;
        this.holdCtx = this.UIDOM.holdCanvas.getContext(`2d`)! as CanvasRenderingContext2D;
    };
    mountNextCanvas() : void{
        this.UIDOM.nextCanvas.width = 6*this.size;
        this.UIDOM.nextCanvas.height = 15*this.size;
        this.nextCtx = this.UIDOM.nextCanvas.getContext(`2d`)! as CanvasRenderingContext2D;
    };
    mountAllCanvas() : void{
        this.mountMainCanvas();
        this.mountHoldCanvas();
        this.mountNextCanvas();
    };
    initGridMatrix() : void{
        for(let i = 0; i < this.rows; i++){
            this.gridMatrix.push(new Array(this.columns))
            for(let j = 0; j < this.columns; j++){
                this.gridMatrix[i][j] = Unit.V;
            }
        }
    };
    fillNextTetriminoUnits() : void{
        let newT: Unit;
        while(this.nextTetriminoUnits.length < Game.NEXT_TETRIMINOES_COUNT){
            do{
                newT = genRandUnit();
            }while(this.nextTetriminoUnits.includes(newT))
            this.nextTetriminoUnits.push(newT);
        }
    };
    renderHoldCanvas() : void{
        for(let i = 0; i < 6; i++){
            for(let j = 0; j < 6; j++){
                drawBox(this.holdCtx, j, i, this.size, Game.VACANT);
            }
        }
        if(this.tetriminoOnHoldUnit != undefined){
            let { matrix, color } = data.tetriminoes[this.tetriminoOnHoldUnit-1];
            let t = new Tetrimino(matrix, color, this);
            t.x = 1;
            t.y = 1;
            t.render(`hold`);
        }
    };
    renderNextCanvas() : void{
        if(this.nextTetriminoUnits.length < Game.NEXT_TETRIMINOES_COUNT){
            throw "Invalid Next Teriminoes Array"
        }
        for(let i = 0; i < 15; i++){
            for(let j = 0; j < 6; j++){
                drawBox(this.nextCtx, j, i, this.size, Game.VACANT);
            }
        }
        let t;
        let y = 1;
        for(let i = 0 ; i < Game.NEXT_TETRIMINOES_COUNT; i++){
            t = new Tetrimino(data.tetriminoes[this.nextTetriminoUnits[i]-1].matrix,
                              data.tetriminoes[this.nextTetriminoUnits[i]-1].color,
                              this)
            t.x = 1;
            if(this.nextTetriminoUnits[i] == Unit.O){
                t.y = y - 1;
            }else{
                t.y = y;
            }

            switch(this.nextTetriminoUnits[i]){
                case Unit.I:
                    y += 5;
                    break;
                case Unit.O:
                    y += 3;
                    break;
                default:
                    y += 3;
                    break;
            }
            t.render(`next`);
        }

    };
    initAndRenderTimer() : void{
        let mm: number = 0, ss: number = 0, ms: number = 0;
        this.timer = setInterval(() => {
            ms += 4;
            if(ms%100 == 0) ss++;
            if(ms%6000 == 0) mm++;
            this.UIDOM.statsBoard.timer.innerHTML = `Time Elapsed:<br />
            ${String(mm).padStart(2,'0')}:${String(ss%60).padStart(2, '0')}.${String(ms%100).padStart(2, '0')}`
        }, 40)
    };
    renderLinesCleared() : void{
        this.UIDOM.statsBoard.linesCleared.innerHTML = `LinesCleared:<br />${this.linesCleared}`
    }
    setActiveTetrimino() : void{
        const t: Unit = this.nextTetriminoUnits.shift()!;
        this.activeTetriminoUnit = t;
        const { matrix, color } = data.tetriminoes[t-1];
        this.activeTetrimino = new Tetrimino(matrix, color, this);
        this.activeGhostTetrimino = new Tetrimino(matrix, `grey`, this);
        this.fillNextTetriminoUnits();
    };
    holdTetrimino() : void{
        if(this.holdingDisabled == false){
            this.activeGhostTetrimino.erase();
            if(this.tetriminoOnHoldUnit != undefined){
                this.activeTetrimino.erase().haltVerticalFalling();
                this.activeTetrimino.clearLockdownTimer();
                let temp = this.activeTetriminoUnit;
                this.activeTetriminoUnit = this.tetriminoOnHoldUnit;
                this.tetriminoOnHoldUnit = temp;
                let { matrix, color } = data.tetriminoes[this.activeTetriminoUnit-1];
                this.activeTetrimino = new Tetrimino(matrix, color, this);
                this.activeGhostTetrimino = new Tetrimino(matrix, `grey`, this);
                this.activeTetrimino.verticalFall();
            }else{
                this.activeTetrimino.erase().haltVerticalFalling();
                this.tetriminoOnHoldUnit = this.activeTetriminoUnit;
                this.next();
            }
            this.holdingDisabled = true;
            this.renderHoldCanvas();
        }

    };
    updateGridMatrix(t: Tetrimino) : Game{
        for(let i = 0; i < t.N; i++){
            for(let j = 0; j < t.N; j++){
                if(t.matrix[i][j]){
                    this.gridMatrix[i+t.y][j+t.x] = t.matrix[i][j];
                }
            }
        }
        return this;
    };
    completeRow(t: Tetrimino) : boolean{
        let atleastOneFullRow = false;
        for(let i = t.y; i < Math.min(t.y+t.N, this.rows); i++){
            if(this.gridMatrix[i].every(c => c != 0)){
                atleastOneFullRow = true;
                this.gridMatrix.splice(i, 1);
                this.gridMatrix.unshift("0".repeat(this.columns).split("").map(n => +n));
                this.linesCleared++;
            }
        }
        this.renderLinesCleared();
        return atleastOneFullRow;
    };
    startGame() : void{
        this.running = true;
        this.linesCleared = 0;
        this.renderLinesCleared();
        this.initGridMatrix();
        this.render();
        this.fillNextTetriminoUnits();
        this.setActiveTetrimino();
        this.activeGhostTetrimino.setProjection(this.activeTetrimino).render();
        this.renderNextCanvas();
        this.renderHoldCanvas();
        this.initAndRenderTimer();
        this.activeTetrimino.verticalFall();
    };
    next() : void{
        this.holdingDisabled = false;
        this.setActiveTetrimino();
        this.renderNextCanvas();
        this.activeTetrimino.verticalFall();
        this.activeGhostTetrimino.setProjection(this.activeTetrimino).render();
    };
    render() : void{
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.columns; j++){
                if(!this.gridMatrix[i][j]){
                    drawBox(this.ctx, j, i, this.size, Game.VACANT);
                }else{
                    drawBox(this.ctx, j, i, this.size, data.tetriminoes[this.gridMatrix[i][j]-1]['color']);
                }
            }
        }
    };
    gameOver() : void{
        this.running = false;
        clearInterval(this.timer);
        alert(`Game over!`);
        // reset
        this.gridMatrix = [];
        this.nextTetriminoUnits = [];
        this.tetriminoOnHoldUnit = undefined;
    };
}
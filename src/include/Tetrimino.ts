import { Unit } from '../Tetriminoes';
import drawBox from "./drawBox";
import Game from "./Game";

class Tetrimino{
    matrix: Unit[][];
    color: string;
    N: number;
    x: number;
    y: number;
    parentGame: Game;

    fall: undefined | number;
    softDropMode: boolean = false;
    static readonly SOFT_DROP_SPEED: number = 0.01;
    static readonly FREEFALL_SPEED: number = 0.5;

    constructor(matrix: Unit[][], color: string, parentGame: Game){
        this.matrix = matrix;
        this.color = color;
        this.N = matrix.length;

        this.x = Math.floor((parentGame.columns - 1)/2) - 1;
        this.y = -3;
        this.parentGame = parentGame;

    }
    setPosition(setter: ((position: [number, number]) => [number, number])): void{
        let [a, b] = setter([this.x, this.y])
        this.x = a;
        this.y = b;
    };
    rotateRight() : Tetrimino{
        let r = Array.from(this.matrix, t => [...t]);
        for(let i = 0; i < this.N; i++){
            for(let j = 0; j < this.N; j++){
                r[i][j] = this.matrix[this.N - 1 - j][i];
            }
        }
        for(let i = 0; i < 3 && this.detectCollision(0, 0, r); i++){
            if(this.x > (this.parentGame.columns/2)){
                this.moveLeft();
            }else if(this.x < (this.parentGame.columns/2)){
                this.moveRight();
            }
            if(this.y + this.N >= this.parentGame.rows){
                this.moveUp();
            }
        }
        this.matrix = Array.from(r, t => [...t]);
        return this;
    };
    rotateLeft() : Tetrimino{
        let r = Array.from(this.matrix, t => [...t]);
        for(let i = 0; i < this.N; i++){
            for(let j = 0; j < this.N; j++){
                r[i][j] = this.matrix[j][this.N - 1 - i];
            }
        }
        for(let i = 0; i < 3 && this.detectCollision(0, 0, r); i++){
            if(this.x > (this.parentGame.columns/2)){
                this.moveLeft();
            }else if(this.x < (this.parentGame.columns/2)){
                this.moveRight();
            }
            if(this.y + this.N >= this.parentGame.rows){
                this.moveUp();
            }
        }
        this.matrix = Array.from(r, t => [...t]);
        return this;
    };
    rotate180() : Tetrimino{
        return this.rotateRight().rotateRight();
    };
    moveRight(collisionHandler: undefined | (() => void) = undefined) : Tetrimino{
        if(this.detectCollision(1, 0)){
            if(!collisionHandler){
                return this;
            }else{
                collisionHandler();
            }
        }
        this.x++;
        return this;
    };
    moveLeft(collisionHandler: undefined | (() => void) = undefined) : Tetrimino{
        if(this.detectCollision(-1, 0)){
            if(!collisionHandler){
                return this;
            }else{
                collisionHandler();
            }
        }
        this.x--;
        return this;
    };
    moveDown(collisionHandler: undefined | (() => void) = undefined) : Tetrimino{
        if(this.detectCollision(0, 1)){
            if(!collisionHandler){
                return this;
            }else{
                collisionHandler();
            }
        }
        this.y++;
        return this;
    };
    moveUp(collisionHandler: undefined | (() => void) = undefined) : Tetrimino{
        if(this.detectCollision(0, -1)){
            if(!collisionHandler){
                return this;
            }else{
                collisionHandler();
            }
        }
        this.y--;
        return this;
    };
    setSoftDropMode(bool: boolean){
        this.softDropMode = bool;
        return this.softDropMode;
    };
    lockTetrimino(){
        try{
            this.parentGame.updateGridMatrix(this).render();
            if(this.parentGame.completeRow(this)){
                this.parentGame.render();
            }
            this.parentGame.next();
        }catch(error){
            this.parentGame.gameOver();
            return;
        }
    };
    hardDrop() : void{
        if(this.fall){
            window.cancelAnimationFrame(this.fall);
            this.fall = undefined;
        }
        let i = 0;
        for(;; i++){
            if(this.detectCollision(0, i)){
                break;
            }
        }
        this.y += i-1;
        this.lockTetrimino();
    };
    varticalFall() : void{
        let start: number, currTime, lastTime = 0;
        const drop: FrameRequestCallback = (now: number) => {
            if(!start){ start = now; }
            currTime = (now - start)/1000;
            if(currTime > lastTime){
                lastTime += this.softDropMode ? Tetrimino.SOFT_DROP_SPEED : Tetrimino.FREEFALL_SPEED;
                if(!this.detectCollision(0, 1)){
                    this.erase().y++;
                    this.render();
                }else{
                    this.lockTetrimino();
                    return;
                }
            }
            this.fall = window.requestAnimationFrame(drop);
        };
        this.fall = window.requestAnimationFrame(drop);
    };
    haltVerticalFalling(){
        if(this.fall){
            window.cancelAnimationFrame(this.fall);
            this.fall = undefined;
        }
    };
    detectCollision(dx: number, dy: number, dt: Unit[][] = this.matrix) : boolean{
        // new cordinates
        let x = this.x + dx;
        let y = this.y + dy;
        // dt - new orientation
        for(let i = y; i < y+this.N; i++)
            for(let j = x; j < x+this.N; j++){
                if(dt[i-y][j-x] != Unit.V){
                    if(i >= this.parentGame.rows){
                        return true;
                    }
                    if(j >= this.parentGame.columns || j <= -1){
                        return true;
                    }
                    if(i >= 0){
                        if(this.parentGame.gridMatrix[i][j] != Unit.V){
                            return true;
                        }
                    }
                }
    
            }
        return false;
    };
    erase(ctxS: string = `main`) : Tetrimino{
        let ctx = this.ctx(ctxS);
        for(let i = 0; i < this.N; i++){
            for(let j = 0; j < this.N; j++){
                if(this.matrix[i][j] != Unit.V){
                    drawBox(ctx, this.x+j, this.y+i, this.parentGame.size, Game.VACANT);
                }
            }
        }
        return this;
    };
    render(ctxS: string = `main`) : Tetrimino{
        let ctx = this.ctx(ctxS);
        for(let i = 0; i < this.N; i++){
            for(let j = 0; j < this.N; j++){
                if(this.matrix[i][j] != Unit.V){
                    drawBox(ctx, this.x+j, this.y+i, this.parentGame.size, this.color);
                }
            }
        }
        return this;
    };
    ctx(ctxS: string = `main`) : CanvasRenderingContext2D{
        switch(ctxS){
            case `main`:
                return this.parentGame.ctx
            case `hold`:
                return this.parentGame.holdCtx
            case `next`:
                return this.parentGame.nextCtx
        }
        throw "Invalid ctx"
    }
};

export default Tetrimino;
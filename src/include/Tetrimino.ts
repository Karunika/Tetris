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
    lockdownTimer: undefined | number;
    lockdownMoves: number = 0;


    static readonly MAX_LOCKDOWN_MOVES: number = 20;
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
        for(let i = 0; i <= 2;){
            for(let j = 0; j <= 2;){
                console.log(i, j);
                if(!this.detectCollision(i, j ,r)){
                    this.x += i;
                    this.y += j;
                    this.matrix = Array.from(r, t => [...t]);
                    return this;
                }
                i == j ? (j++) : (i++)
            }
        }
        for(let i = 0; i >= -2;){
            for(let j = 0; j >= -2;){
                console.log(i, j);
                if(!this.detectCollision(i, j ,r)){
                    this.x += i;
                    this.y += j;
                    this.matrix = Array.from(r, t => [...t]);
                    return this;
                }
                i == j ? (i--) : (j--)
            }
        }
        return this;
    };
    rotateLeft() : Tetrimino{
        let r = Array.from(this.matrix, t => [...t]);
        for(let i = 0; i < this.N; i++){
            for(let j = 0; j < this.N; j++){
                r[i][j] = this.matrix[j][this.N - 1 - i];
            }
        }
        for(let i = 0; i <= 2;){
            for(let j = 0; j <= 2;){
                console.log(i, j);
                if(!this.detectCollision(i, j ,r)){
                    this.x += i;
                    this.y += j;
                    this.matrix = Array.from(r, t => [...t]);
                    return this;
                }
                i == j ? (j++) : (i++)
            }
        }
        for(let i = 0; i >= -2;){
            for(let j = 0; j >= -2;){
                console.log(i, j);
                if(!this.detectCollision(i, j ,r)){
                    this.x += i;
                    this.y += j;
                    this.matrix = Array.from(r, t => [...t]);
                    return this;
                }
                i == j ? (i--) : (j--)
            }
        }
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
        if(this.lockdownTimer){
            return;
        }
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
    verticalFall() : void{
        this.clearLockdownTimer();
        this.haltVerticalFalling();
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
                    this.lockdownTimer = window.setTimeout(() => {
                        this.lockTetrimino();
                    }, 1000)
                    this.lockdownMoves++;
                    return;
                }
            }
            this.fall = window.requestAnimationFrame(drop);
        };
        this.fall = window.requestAnimationFrame(drop);
    };
    resetLockdownTimer() : void{
        if(this.lockdownTimer == undefined){
            return;
        }
        clearTimeout(this.lockdownTimer);
        if(!this.detectCollision(0, 1)){
            this.erase().y++;
            this.render();
            this.verticalFall();
            this.lockdownTimer == undefined;
            return;
        }
        if(this.lockdownMoves >= Tetrimino.MAX_LOCKDOWN_MOVES){
            this.lockTetrimino();
            this.lockdownMoves = 0;
            return;
        }
        this.lockdownMoves++;
        this.lockdownTimer = window.setTimeout(() => {
            this.lockTetrimino();
        }, 1000)
    };
    clearLockdownTimer() : void{
        if(this.clearLockdownTimer != undefined){
            window.clearTimeout(this.lockdownTimer);
        }
    };
    haltVerticalFalling() : void{
        if(this.fall){
            window.cancelAnimationFrame(this.fall);
            this.fall = undefined;
        }
    };
    detectCollision(dx: number, dy: number, dt: Unit[][] = this.matrix) : Boolean{
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
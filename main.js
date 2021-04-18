const canvas = document.querySelector('canvas');

// Config
// Grid Matrix Dimensions
const COLUMNS = 10;
const ROWS = 20;

// Unit Dimension
const SIZE = 32;
const VACANT = "black"; // Default Colour

// Freefall Speed
const FREEFALL_SPEED = 1; // in seconds
const SOFT_DROP_SPEED = 0.1;

// Tetriminoes
const T = [
    [0,1,0],
    [1,1,1],
    [0,0,0]
];
const S = [
    [0,1,1],
    [1,1,0],
    [0,0,0]
];
const Z = [
    [1,1,0],
    [0,1,1],
    [0,0,0]
];
const L = [
    [0,0,1],
    [1,1,1],
    [0,0,0]
];
const J = [
    [1,0,0],
    [1,1,1],
    [0,0,0]
];
const I = [
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0]
];
const O = [
    [0,0,0,0],
    [0,1,1,0],
    [0,1,1,0],
    [0,0,0,0]
];
const tetriminoes = [
    { matrix: T, color: "rgb(176, 41, 138)" },
    { matrix: S, color: "rgb(89, 177, 2)" },
    { matrix: Z, color: "rgb(215, 15, 55)" },
    { matrix: L, color: "rgb(227, 91, 5)" },
    { matrix: J, color: "rgb(17, 32, 99)" },
    { matrix: I, color: "rgb(14, 155, 215)" },
    { matrix: O, color: "rgb(227, 159, 4)" }
];
const MAX_TETRIMINO_HISTORY = 8;

// Canvas Setup
canvas.width = COLUMNS*SIZE;
canvas.height = ROWS*SIZE;

const ctx = canvas.getContext('2d');

// Draw individual box
const drawBox = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*SIZE, y*SIZE, SIZE, SIZE);
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "grey";
    ctx.strokeRect(x*SIZE, y*SIZE, SIZE, SIZE);
};

// Grid Setup
for(i in [...Array(ROWS)])
    for(j in [...Array(COLUMNS)])
        drawBox(Number(j), Number(i), VACANT);

// Tetrimino class
class Tetrimino{
    constructor({matrix: tetrimino, color}){
        this.tetrimino = tetrimino;
        this.color = color;
        this.N = tetrimino.length;
        this.vRot = true;
        // Position coordinates
        this.x = Math.floor((COLUMNS-1)/2)-1;
        this.y = -3;
        // Properties needed only when the tetrimino is active
        this.softDropMode = false;
        this.placed = false;
    }
    iter(callback){
        for(i in [...Array(this.N)])
            for(j in [...Array(this.N)])
                callback(this.tetrimino[i][j], parseInt(i), parseInt(j));
    }
    // Rotations
    rotateRight(){
        this.vRot = !this.vRot;
        let r = Array.from(this.tetrimino, t => [...t]);
        this.iter((_, i, j) => { r[i][j] = this.tetrimino[this.N - 1 - j][i]; });
        this.tetrimino = Array.from(r, t => [...t]);
        return this;
    }
    rotateLeft(){
        this.vRot = !this.vRot;
        let r = Array.from(this.tetrimino, t => [...t]);
        this.iter((_, i, j) => { r[i][j] = this.tetrimino[j][this.N - 1 - i]; });
        this.tetrimino = Array.from(r, t => [...t]);
        return this;
    }
    rotate180(){
        if(this.vRot){
            let r = Array.from(this.tetrimino, t => [...t]);
            this.iter((_, i, j) => { r[i][j] = this.tetrimino[this.N - 1 - i][j]; });
            this.tetrimino = Array.from(r, t => [...t]);
        }
        else
        this.tetrimino.map(row => row.reverse());
        return this;
    }
    // Movements
    moveRight(){
        if(this.x == COLUMNS - this.N) return false;
        this.erase;
        this.x++;
        this.render;
        return true;
    }
    moveLeft(){
        if(this.x == 0) return false;
        this.erase;
        this.x--;
        this.render();
        return true;
    }
    moveDown(){
        if(this.y == ROWS - this.N) return false;
        this.erase().y++;
        this.render();
        return true;
    }
    fall(){
        let start, currTime, lastTime = 0;
        const drop = now => {
            if(!start)
                start = now;

            currTime = (now - start)/1000;
            if(currTime > lastTime){
                lastTime += this.softDropMode ? SOFT_DROP_SPEED : FREEFALL_SPEED;
                if(!this.moveDown()){
                    this.placed = true;
                    GameGrid.updateGridMatrix(this.x, this.y, this.N, this.tetrimino);
                    GameState.nextTetriminoFall();
                    return;
                }
            }
            window.requestAnimationFrame(drop);
        };
        window.requestAnimationFrame(drop);
    };
    // setter
    setSoftDropMode(bool){
        this.softDropMode = bool;
        return this.softDropMode;
    };
    collisionDetection(){
        GameGrid.matrix
    }
    // Erase and Render
    erase(){
        this.iter((t, i, j) => { if(t) drawBox(this.x+j, this.y+i, VACANT); });
        return this;
    };
    render(){
        this.iter((t, i, j) => { if(t) drawBox(this.x+j, this.y+i, this.color); });
        return this;
    };
    // Public interface
    renderRotateRight(){
        this.erase().rotateRight().render();
    }
    renderRotateLeft(){
        this.erase().rotateLeft().render();
    }
    renderRotate180(){
        this.erase().rotate180().render();
    }
}

// Game state
let tetriminoHistory = [];
const GameState = {
    activeTetrimino: undefined,
    activeTetriminoIndex: undefined,
    generateRandomTetrimino: function() {
        let rand = Math.floor(Math.random()*tetriminoes.length);
        // In order to avoid repeating a tetrimino
        while(this.activeTetriminoIndex == rand)
            rand = Math.floor(Math.random()*tetriminoes.length);

        // bruh wtf
        this.activeTetrimino = new Tetrimino(tetriminoes[rand]);
        return this;
    },
    dropActiveTetrimino: function() {
        this.activeTetrimino.fall();
        return this;
    },
    pushTetriminoHistory: function() {
        if(tetriminoHistory.length > MAX_TETRIMINO_HISTORY)
            tetriminoHistory.unshift();
        tetriminoHistory.push(this.activeTetriminoIndex);
        return this;
    },
    nextTetriminoFall: function() {
        this.generateRandomTetrimino()
            .dropActiveTetrimino()
            .pushTetriminoHistory();
    }
}
GameState.nextTetriminoFall();

const GameGrid = {
    matrix: [],
    initMatrix: function() {
        for(i in [...Array(ROWS)]) this.matrix.push("0".repeat(COLUMNS).split("").map(n => +n));
        console.log(this.matrix)
    },
    updateGridMatrix: function(x, y, N, t) {
        for(let i = y; i < y+N; i++)
            for(let j = x; j < x+N; j++)
                if(t[Math.abs(i-y)][Math.abs(j-x)]) this.matrix[i][j] = 1;
        console.log(this.matrix);
    }
}
GameGrid.initMatrix();


const GameControls = {
    LEFT: 37,
    UP: 38,
    RIGHT:39,
    DOWN: 40,
    SPACE: 33,
    Z: 90,
    A: 65,
    C: 67
}

// Event Listeners
document.addEventListener('keydown', e => {
    const {LEFT, UP, RIGHT, DOWN, SPACE, Z, A, C} = GameControls;
    let { activeTetrimino } = GameState;
    switch(e.keyCode){
        case LEFT:
            activeTetrimino.moveLeft();
            break;
        case UP:
            activeTetrimino.renderRotateRight();
            break;
        case RIGHT:
            activeTetrimino.moveRight();
            break;
        case DOWN:
            activeTetrimino.setSoftDropMode(true);
            break;
        // case SPACE:
        //     activeTetrimino.fall();
        //     break;
        case Z:
            activeTetrimino.renderRotateRight();
            break;
        case A:
            activeTetrimino.renderRotate180();
            break;
        // case C:
        //     break;
        //     activeTetrimino.holdPiece();
    }
});
document.addEventListener('keyup', e => {
    let { activeTetrimino } = GameState;
    if(e.keyCode = GameControls.DOWN)
        activeTetrimino.setSoftDropMode(false);
});
const canvas = document.querySelector('canvas');

// Config
// Grid Matrix Dimensions
const COLUMNS = 10;
const ROWS = 20;

// Unit Dimension
const SIZE = 32;
const VACANT = "black"; // Default Colour

// Freefall Speed (in seconds)
const FREEFALL_SPEED = 1;
const SOFT_DROP_SPEED = 0.01;

// Tetriminoes
const T = [
    [0,1,0],
    [1,1,1],
    [0,0,0]
];
const S = [
    [0,2,2],
    [2,2,0],
    [0,0,0]
];
const Z = [
    [3,3,0],
    [0,3,3],
    [0,0,0]
];
const L = [
    [0,0,4],
    [4,4,4],
    [0,0,0]
];
const J = [
    [5,0,0],
    [5,5,5],
    [0,0,0]
];
const I = [
    [0,6,0,0],
    [0,6,0,0],
    [0,6,0,0],
    [0,6,0,0]
];
const O = [
    [0,0,0,0],
    [0,7,7,0],
    [0,7,7,0],
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
const NEXT_TETRIMINOES_COUNT = 4; // wtf should i name this (P.S. cant exceed 7)

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
    // Rotations - change orientation (matrix)
    rotateRight(){
        let r = Array.from(this.tetrimino, t => [...t]);
        this.iter((_, i, j) => { r[i][j] = this.tetrimino[this.N - 1 - j][i]; });
        if(this.detectCollision(0, 0, r))
            return this;
        this.tetrimino = Array.from(r, t => [...t]);
        return this;
    }
    rotateLeft(){
        let r = Array.from(this.tetrimino, t => [...t]);
        this.iter((_, i, j) => { r[i][j] = this.tetrimino[j][this.N - 1 - i]; });
        if(this.detectCollision(0, 0, r))
            return this;
        this.tetrimino = Array.from(r, t => [...t]);
        return this;
    }
    rotate180(){
        return this.rotateRight().rotateRight();
    }
    // Movements - change coridinates in the grid (x, y)
    moveRight(){
        if(this.detectCollision(1, 0))
            return this;
        this.x++;
        return this;
    }
    moveLeft(){
        if(this.detectCollision(-1, 0))
            return this;
        this.x--;
        return this;
    }
    moveDown(){
        if(this.detectCollision(0, 1))
            return this;
        this.x--;
        return this;
    }
    // Fall animation
    fall(){
        let start, currTime, lastTime = 0;
        const drop = now => {
            if(!start)
                start = now;

            currTime = (now - start)/1000;
            if(currTime > lastTime){
                lastTime += this.softDropMode ? SOFT_DROP_SPEED : FREEFALL_SPEED;
                if(!this.detectCollision(0, 1)){
                    this.erase().y++;
                    this.render();
                }else{
                    this.placed = true;
                    GameGrid.updateGridMatrix(this.x, this.y, this.N, this.tetrimino);
                    if(GameGrid.completeRow())
                        GameGrid.render();
                    GameState.nextTetriminoFall();
                    return;
                }
            }
            window.requestAnimationFrame(drop);
        };
        window.requestAnimationFrame(drop);
    };
    // getter and setter
    setSoftDropMode(bool){
        this.softDropMode = bool;
        return this.softDropMode;
    };
    setPlaced(bool){
        this.placed = bool;
        return this.placed;
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
}

const GameGrid = {
    matrix: [],
    initMatrix: function() {
        for(i in [...Array(ROWS)]) this.matrix.push("0".repeat(COLUMNS).split("").map(n => +n));
    },
    updateGridMatrix: function(x, y, N, t) {
        for(let i = y; i < y+N; i++)
            for(let j = x; j < x+N; j++)
                if(t[Math.abs(i-y)][Math.abs(j-x)]) this.matrix[i][j] = t[Math.abs(i-y)][Math.abs(j-x)];
    },
    completeRow: function() {
        let atleastOneFullRow = false
        for(let i = 0; i < ROWS; i++){
            if(this.matrix[i].every(c => c != 0)){
                atleastOneFullRow = true;
                this.matrix.splice(i, 1);
                this.matrix.unshift("0".repeat(COLUMNS).split("").map(n => +n));
            }
        }
        return atleastOneFullRow;
    },
    render: function(){
        for(let i = 0; i < ROWS; i++){
            for(let j = 0; j < COLUMNS; j++){
                if(!this.matrix[i][j])
                    drawBox(j, i, VACANT);
                else
                    drawBox(j, i, tetriminoes[this.matrix[i][j]-1]['color']);
            }
        }
    }
}
GameGrid.initMatrix();

// Game state
const GameState = {
    activeTetrimino: undefined,
    activeTetriminoIndex: undefined,
    nextTetriminoIndexes: [],
    tetriminoOnHold: undefined,
    generateRandomTetriminoIndex: function() {
        let rand = Math.floor(Math.random()*tetriminoes.length);
        // In order to avoid repeating a tetrimino in the nextTerminoes list
        while(this.nextTetriminoIndexes.includes(rand))
            rand = Math.floor(Math.random()*tetriminoes.length);
        return rand;
    },
    updateNextTetriminoIndexes: function(rand) {
        this.activeTetriminoIndex = this.nextTetriminoIndexes.shift();
        this.nextTetriminoIndexes.push(rand);
        return this;
    },
    setActiveTetrimino: function() {
        this.activeTetrimino = new Tetrimino(tetriminoes[this.activeTetriminoIndex]);
        return this;
    },
    // generate an array of `NEXT_TETRIMINOES_COUNT` random numbers
    dropActiveTetrimino: function() {
        this.activeTetrimino.fall();
        return this;
    },
    generateFirstLot: function() {
        let rand;
        for(let i = 0; i < NEXT_TETRIMINOES_COUNT; i++){
            rand = Math.floor(Math.random()*tetriminoes.length);

            while(this.nextTetriminoIndexes.includes(rand))
                rand = Math.floor(Math.random()*tetriminoes.length);
    
            this.nextTetriminoIndexes.push(rand);
        }
        return this;
    },
    beginGame: function() {
        this.generateFirstLot()
            .nextTetriminoFall();
    },
    nextTetriminoFall: function() {
        this.updateNextTetriminoIndexes(this.generateRandomTetriminoIndex())
            .setActiveTetrimino()
            .dropActiveTetrimino();
        return this;
    },
    holdTetrimino: function() {
        this.tetriminoOnHold = this.activeTetrimino;
        this.nextTetriminoFall;
    }
}
GameState.beginGame();


Tetrimino.prototype.detectCollision = function(dx, dy, dt = this.tetrimino) {
    // new cordinates
    let x = this.x + dx;
    let y = this.y + dy;
    // dt - new orientation
    for(let i = y; i < y+this.N; i++)
        for(let j = x+dx; j < x+this.N; j++){
            if(dt[i-y][j-x]){
                if(i >= ROWS)
                    return true;
                if(j >= COLUMNS || j <= -1)
                    return true;
                if(i >= 0)
                    if(GameGrid.matrix[i][j])
                        return true;
            }

        }
    return false;
}

// Enumerations
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
    e.preventDefault();
    const { LEFT, UP, RIGHT, DOWN, SPACE, Z, A, C } = GameControls;
    let { activeTetrimino } = GameState;
    switch(e.keyCode){
        case LEFT:
            activeTetrimino.erase().moveLeft().render();
            break;
        case UP:
            activeTetrimino.erase().rotateRight().render();
            break;
        case RIGHT:
            activeTetrimino.erase().moveRight().render();
            break;
        case DOWN:
            activeTetrimino.setSoftDropMode(true);
            break;
        case SPACE:
            activeTetrimino.fall();
            break;
        case Z:
            activeTetrimino.erase().rotateRight().render();
            break;
        case A:
            activeTetrimino.erase().rotate180().render();
            break;
        case C:
            GameState.holdTetrimino();
            break;
    }
});
document.addEventListener('keyup', e => {
    const { LEFT, UP, RIGHT, DOWN, SPACE, Z, A, C } = GameControls;
    let { activeTetrimino } = GameState;
    switch(e.keyCode){
        case LEFT:
            // activeTetrimino.erase().moveLeft().render();
            break;
        case UP:
            // activeTetrimino.erase().rotateRight().render();
            break;
        case RIGHT:
            // activeTetrimino.erase().moveRight().render();
            break;
        case DOWN:
            activeTetrimino.setSoftDropMode(false);
            break;
        case SPACE:
            // activeTetrimino.fall();
            break;
        case Z:
            // activeTetrimino.erase().rotateRight().render();
            break;
        case A:
            // activeTetrimino.erase().rotate180().render();
            break;
        case C:
            // GameState.holdTetrimino();
            break;
    }
});
document.addEventListener('keypress', e => {
    e.preventDefault();
    let { activeTetrimino } = GameState;
    if(e.keyCode == GameControls.DOWN)
        activeTetrimino.erase().moveDown(),render();
})
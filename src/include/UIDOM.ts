export interface I_UIDOM {
    mainCanvas: HTMLCanvasElement;
    nextCanvas: HTMLCanvasElement;
    holdCanvas: HTMLCanvasElement;
    statsBoard: I_StatsBoard;
}
export interface I_StatsBoard {
    timer: HTMLSpanElement;
    linesCleared: HTMLSpanElement;
}
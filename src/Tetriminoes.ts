export const enum Unit { V,T,S,Z,L,J,I,O }
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
export const data = {
    T,S,Z,L,J,I,O,
    tetriminoes
}
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
    { matrix: T, color: "purple" },
    { matrix: S, color: "green" },
    { matrix: Z, color: "red" },
    { matrix: L, color: "orange" },
    { matrix: J, color: "blue" },
    { matrix: I, color: "cyan" },
    { matrix: O, color: "yellow" }
];
export const data = {
    T,S,Z,L,J,I,O,
    tetriminoes
}
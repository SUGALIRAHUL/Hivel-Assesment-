const file = require("fs");

const jsonInput = JSON.parse(file.readFileSync("input.json", "utf8"));

const limitN = jsonInput.keys.n;
const limitK = jsonInput.keys.k;

let pointsX = [];
let pointsY = [];

let entryIndex = 0;
for (let record of Object.keys(jsonInput)) {
    if (record === "keys") continue;
    entryIndex++;

    if (entryIndex > limitK) break;

    let numBase = parseInt(jsonInput[record].base);
    let rawValue = jsonInput[record].value;

    let convertedValue = parseInt(rawValue, numBase);

    pointsX.push(parseInt(record));
    pointsY.push(convertedValue);
}

function createVandermondeMatrix(arrX, size) {
    let vMatrix = [];
    for (let r = 0; r < size; r++) {
        let vRow = [];
        for (let c = 0; c < size; c++) {
            vRow.push(Math.pow(arrX[r], c));
        }
        vMatrix.push(vRow);
    }
    return vMatrix;
}

function gaussianElimination(mat, vec) {
    let dim = mat.length;

    for (let i = 0; i < dim; i++) {
        let best = i;
        for (let j = i + 1; j < dim; j++) {
            if (Math.abs(mat[j][i]) > Math.abs(mat[best][i])) {
                best = j;
            }
        }

        [mat[i], mat[best]] = [mat[best], mat[i]];
        [vec[i], vec[best]] = [vec[best], vec[i]];

        for (let j = i + 1; j < dim; j++) {
            let ratio = mat[j][i] / mat[i][i];
            for (let k = i; k < dim; k++) {
                mat[j][k] -= ratio * mat[i][k];
            }
            vec[j] -= ratio * vec[i];
        }
    }

    let solution = Array(dim).fill(0);
    for (let i = dim - 1; i >= 0; i--) {
        let temp = vec[i];
        for (let j = i + 1; j < dim; j++) {
            temp -= mat[i][j] * solution[j];
        }
        solution[i] = temp / mat[i][i];
    }

    return solution;
}

let matrixV = createVandermondeMatrix(pointsX, limitK);
let coeffs = gaussianElimination(matrixV, pointsY);

console.log("Constant term C =", coeffs[0]);

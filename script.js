const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');

const winsDisplay = document.getElementById('wins');
const drawsDisplay = document.getElementById('draws');
const lossesDisplay = document.getElementById('losses');
const pointsDisplay = document.getElementById('points');

let levelSelect = document.getElementById('level'); // Suponiendo que tienes un select para los niveles
let startButton = document.getElementById('startButton');


let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let level = 'beginner'; // Nivel por defecto

let wins = 0;
let draws = 0;
let losses = 0;
let points = 0;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Función para iniciar el juego
function startGame() {
    if (gameActive) {
        // alert('El juego ya está en curso.');
        return;
    }

    gameActive = true;
    difficultySelect.disabled = true;  // Deshabilitar el select cuando comienza el juego
    startButton.disabled = true; // Deshabilitar el boton de inicio cuando comienza el juego
    // alert(`Juego iniciado en nivel: ${level}`);
}


// Manejo del botón de iniciar
startButton.addEventListener('click', startGame);

// Función para verificar si hay un ganador
function checkWinner() {
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'tie';
}

// Función para manejar los turnos
function handleCellClick(event) {
    const index = event.target.getAttribute('data-index');
    
    if (board[index] || !gameActive) return;

    board[index] = currentPlayer;
    event.target.textContent = currentPlayer;


    // Deshabilitar el botón de inicio y el select de dificultad si una celda está seleccionada
    // if (board.includes('')) {
        startButton.disabled = true;
        difficultySelect.disabled = true;
    // }
    
    const result = checkWinner();
    if (result) {
        gameActive = false;
        // statusDisplay.textContent = result === 'tie' ? 'Empate!' : `¡Ganador: ${result}!`;
        if (result === 'X') {
            statusDisplay.textContent = `¡Ganaste!`;
            updateScore('win');
        } else if (result === 'O') {
            statusDisplay.textContent = `¡Perdiste!`;
            updateScore('lose');
        } else {
            statusDisplay.textContent = 'Empate!';
            updateScore('draw');
        }
        return;
    }

    currentPlayer = 'O';
    setTimeout(() => computerTurn(), 500);
}

// Turno de la máquina
function computerTurn() {
    if (!gameActive) return;

    let move;
    switch (level) {
        case 'beginner':
            move = randomMove();
            break;
        case 'medium':
            move = Math.random() < 0.5 ? randomMove() : bestMove();
            break;
        case 'advanced':
            move = Math.random() < 0.8 ? bestMove() : randomMove();
            break;
        case 'expert':
            move = bestMove();
            break;
    }

    if (move !== undefined) {
        board[move] = 'O';
        document.querySelector(`[data-index="${move}"]`).textContent = 'O';

        const result = checkWinner();
        if (result) {
            gameActive = false;
            if (result === 'O') {
                statusDisplay.textContent = `¡Perdiste!`;
                updateScore('lose');
            } else if (result === 'tie') {
                statusDisplay.textContent = 'Empate!';
                updateScore('draw');
            }
            return;
        }

        currentPlayer = 'X';
    }
}

// Movimiento aleatorio para la máquina
function randomMove() {
    const availableMoves = board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Mejor movimiento utilizando el algoritmo Minimax
function bestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    const result = checkWinner();
    if (result === 'X') return -10;
    if (result === 'O') return 10;
    if (result === 'tie') return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}


// Reiniciar el juego
function restartGame() {
    // board = ['', '', '', '', '', '', '', '', ''];
    // currentPlayer = 'X';
    // gameActive = true;
    // cells.forEach(cell => cell.textContent = '');
    // statusDisplay.textContent = '';
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    cells.forEach(cell => cell.textContent = '');
    statusDisplay.textContent = '';

    difficultySelect.disabled = false;  // Deshabilitar el select cuando comienza el juego
    startButton.disabled = false;
}

// Cambiar nivel de dificultad
difficultySelect.addEventListener('change', (event) => {
    level = event.target.value;
});

// Añadir listeners a las celdas y botón de reinicio
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);


// Función para actualizar la puntuación
function updateScore(result) {
    let scoreChange = 0;
    
    switch (level) {
        case 'beginner':
            if (result === 'win') {
                wins++;
                scoreChange = 1;
            } else if (result === 'draw') {
                draws++;
                scoreChange = 0.5;
            } else {
                losses++;
                scoreChange = -1;
            }
            break;

        case 'medium':
            if (result === 'win') {
                wins++;
                scoreChange = 2;
            } else if (result === 'draw') {
                draws++;
                scoreChange = 0.5;
            } else {
                losses++;
                scoreChange = -1;
            }
            break;

        case 'advanced':
            if (result === 'win') {
                wins++;
                scoreChange = 3;
            } else if (result === 'draw') {
                draws++;
                scoreChange = 1;
            } else {
                losses++;
                scoreChange = -2;
            }
            break;

        case 'expert':
            if (result === 'win') {
                wins++;
                scoreChange = 4;
            } else if (result === 'draw') {
                draws++;
                scoreChange = 1;
            } else {
                losses++;
                scoreChange = -2;
            }
            break;
    }

    // Actualiza puntos y asegura que no sean negativos
    points += scoreChange;
    if (points < 0) {
        points = 0;  // Prevenir puntuaciones negativas
    }

    // Actualizar la visualización en el marcador
    winsDisplay.textContent = wins;
    drawsDisplay.textContent = draws;
    lossesDisplay.textContent = losses;
    pointsDisplay.textContent = points;
}


levelSelect.addEventListener('change', (event) => {
    if (gameActive) {
        // alert('No puedes cambiar el nivel durante una partida activa.');
        // Volver al nivel anterior
        event.target.value = level;
    } else {
        level = event.target.value; // Solo se cambia si el juego no está activo
    }
});

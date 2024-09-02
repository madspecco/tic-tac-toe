// Gameboard Factory
// Since there will be only one Gameboard needed, I will create it as an array inside an IIFE (Immediately Invoked Function Expression)
const Gameboard = (() => {
    // Private game board array
    let board = ['', '', '', '', '', '', '', '', ''];

    // Function to get the current state of the board
    const getBoard = () => board;

    // Function to set a value in the board array
    const setSquare = (index, symbol) => {
        if (index >= 0 && index < board.length && board[index] === '') {
            board[index] = symbol;
            return true;
        }
        return false;
    };

    // Function to reset the game board
    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };

    return { getBoard, setSquare, resetBoard };
})();


// Player Factory will create the player objects with a name and symbol ('X' or 'O')
const Player = (name, symbol) => {
    return { name, symbol };
};


// GameController Module, manages the game flow, also an IIFE to avoid polluting the global scope
const GameController = (() => {
    // Initialize two players
    const player1 = Player('Player 1', 'X');
    const player2 = Player('Player 2', 'O');
    let currentPlayer = player1;
    let isGameOver = false;

    // Switch to the other player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    // Play a turn at a specific index
    const playTurn = (index) => {
        if (!isGameOver && Gameboard.setSquare(index, currentPlayer.symbol)) {
            if (checkWin(currentPlayer.symbol)) {
                alert(`${currentPlayer.name} wins!`);
                isGameOver = true;
            } else if (Gameboard.getBoard().every(square => square !== '')) {
                alert("It's a tie!");
                isGameOver = true;
            } else {
                switchPlayer();
            }
        }
    };

    // Check if the current player has won
    const checkWin = (symbol) => {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        return winConditions.some(condition => 
            condition.every(index => Gameboard.getBoard()[index] === symbol)
        );
    };

    // Reset the game to its initial state
    const resetGame = () => {
        Gameboard.resetBoard();
        isGameOver = false;
        currentPlayer = player1;
    };

    return { playTurn, resetGame };
})();


// Display Controller Module, responsible for updating the objects inside the DOM and handling user interactions
const DisplayController = (() => {
    const gameboardDiv = document.getElementById('gameboard');
    const restartButton = document.getElementById('restart-btn');

    // Update the display to reflect the current game board state
    const updateDisplay = () => {
        gameboardDiv.innerHTML = '';
        Gameboard.getBoard().forEach((symbol, index) => {
            const square = document.createElement('div');
            square.textContent = symbol;
            square.addEventListener('click', () => GameController.playTurn(index));
            gameboardDiv.appendChild(square);
        });
    };

    // Set up the restart button to reset the game
    const setupRestartButton = () => {
        restartButton.addEventListener('click', () => {
            GameController.resetGame();
            updateDisplay();
        });
    };

    // Initialize the game display
    const initialize = () => {
        updateDisplay();
        setupRestartButton();
    };

    return { initialize };
})();

// Initialize the game when the page loads
DisplayController.initialize();
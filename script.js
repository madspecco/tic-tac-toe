// Gameboard Factory
// Since there will be only one Gameboard needed, I will create it as an array inside an IIFE (Immediately Invoked Function Expression)
const Gameboard = (() => {
    // Private game board array
    let board = ['', '', '', '', '', '', '', '', ''];

    // Function to get the current state of the board
    const getBoard = () => board;

    // Function to set a value in the board array
    const setSquare = (index, symbol) => {
        console.log('Attempting to set square at index:', index, 'with symbol:', symbol); // Log setting square
        
        if (index >= 0 && index < board.length && board[index] === '') {
            board[index] = symbol;
            return true;
        }
        console.log('Failed to set square at index:', index); // Log failed attempt
        return false;
    };

    // Function to reset the game board
    const resetBoard = () => {
        console.log('Resetting board'); // Log board reset
        board = ['', '', '', '', '', '', '', '', ''];
    };

    return { getBoard, setSquare, resetBoard };
})();


// Player Factory will create the player objects with a name and symbol ('X' or 'O')
const Player = (name, symbol) => ({ name, symbol });


// GameController Module, manages the game flow, also an IIFE to avoid polluting the global scope
const GameController = (() => {
    // Initialize two players
    const player1 = Player('Player 1', 'X');
    const player2 = Player('Player 2', 'O');
    let currentPlayer = player1;
    let isGameOver = false;

    // Switch to the other player
    const switchPlayer = () => { currentPlayer = currentPlayer === player1 ? player2 : player1; };

    // Play a turn at a specific index
    const playTurn = (index) => {
        console.log('Player:', currentPlayer.name); // Log current player
        
        if (!isGameOver && Gameboard.setSquare(index, currentPlayer.symbol)) {

            if (checkWin(currentPlayer.symbol)) {
                isGameOver = true;
                // alert(`${currentPlayer.name} wins!`);
            }

            else if (Gameboard.getBoard().every(square => square !== '')) {
                isGameOver = true;
                // alert("It's a tie!");
            }

            else {
                switchPlayer();
                console.log('Switched to player:', currentPlayer.name); // Log player switch
            }
        }

        else {
            console.log('Invalid move or game over'); // Log invalid move or game over status
        }
    };

    // Check if the current player has won
    const checkWin = (symbol) => {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        const win = winConditions.some(condition => 
            condition.every(index => Gameboard.getBoard()[index] === symbol)
        );
        
        console.log('Checking win for symbol:', symbol); // Log symbol being checked
        return win;
    };

    // Reset the game to its initial state
    const resetGame = () => {
        Gameboard.resetBoard();
        isGameOver = false;
        currentPlayer = player1;
    };

    const getGameOverStatus = () => isGameOver;

    return { playTurn, resetGame, getGameOverStatus };
})();


// Display Controller Module, responsible for updating the objects inside the DOM and handling user interactions
const DisplayController = (() => {
    const gameboardDiv = document.getElementById('gameboard');
    const restartButton = document.getElementById('restart-btn');

    // Update the display to reflect the current game board state
    const updateDisplay = () => {
        console.log('Updating display'); // Log when display is updated
        gameboardDiv.innerHTML = '';
        Gameboard.getBoard().forEach((symbol, index) => {
            const square = document.createElement('div');
            square.textContent = symbol;
            square.classList.add('square'); // Add a class for better styling and debugging
            
            square.addEventListener('click', () => {
                if (!GameController.getGameOverStatus() && Gameboard.getBoard()[index] === '') {
                    GameController.playTurn(index);
                    updateDisplay(); // Refresh the display after a turn
                }
            });
            gameboardDiv.appendChild(square);
        });
    };

    // Set up the restart button to reset the game
    const setupRestartButton = () => {
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked'); // Log restart button click
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
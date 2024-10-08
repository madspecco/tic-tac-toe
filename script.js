// Bot difficulty levels
const difficultyLevels = {
    easy: 0.1,      // 10% chance of making the best move
    medium: 0.5,    // 50% chance of making the best move
    hard: 0.9,      // 90% chance of making the best move
    impossible: 1   // 100% chance of making the best move
};
    
let botDifficulty = difficultyLevels.medium;    // Set medium by default
    
// Function to set the difficulty based on selection
const setDifficulty = (difficulty) => {
    botDifficulty = difficultyLevels[difficulty] || difficultyLevels.medium;
};

// Event listener for the difficulty menu
document.getElementById('difficulty').addEventListener('change', (event) => {
    setDifficulty(event.target.value);
    console.log('Difficulty set to:', event.target.value);
});


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
        console.log('Resetting board'); // Log board reset
        board = ['', '', '', '', '', '', '', '', ''];
    };

    return { getBoard, setSquare, resetBoard };
})();


// Player Factory will create the player objects with a name and symbol ('X' or 'O')
const Player = (name, symbol, isComputer = false) => ({ name, symbol, isComputer });


// GameController Module, manages the game flow, also an IIFE to avoid polluting the global scope
const GameController = (() => {
    // Initialize two players
    const player1 = Player('Player 1', 'X');
    // const player2 = Player('Player 2', 'O');
    const computerPlayer = Player('Player 2', 'O', true);
    let currentPlayer = player1;
    let isGameOver = false;

    // Win conditions of the game
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Minimax algorithm
    const Minimax = (board, depth, isMaximizing) => {
        const scores = {
            X: -1, // Player 1 (human)
            O: 1,  // Computer
            tie: 0
        };
        
        // Check for terminal state
        const winner = getWinner(board);
        if (winner !== null) {
            return scores[winner];
        }
        
        // Check if it is the computer's turn (a.k.a "maximizing move")
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = computerPlayer.symbol;
                    let score = Minimax(board, depth + 1, false);
                    board[i] = ''; // Undo move
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        }

        // Check if it is the player's turn (a.k.a "minimizing move")
        else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = player1.symbol;
                    let score = Minimax(board, depth + 1, true);
                    board[i] = ''; // Undo move
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };
    
    // Function to evaluate all possible moves, prioritizing immediate wins if possible
    const getBestMove = () => {
        const board = Gameboard.getBoard();
        let bestScore = -Infinity;
        let bestMoves = [];
        let allMoves = [];
        
        // Evaluate all possible moves
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = computerPlayer.symbol;
                let score = Minimax(board, 0, false);
                board[i] = ''; // Undo move
                
                // Collect all possible moves
                allMoves.push(i);

                // Compare moves and store them
                if (score > bestScore) {
                    bestScore = score;
                    bestMoves = [i]; // Reset best moves with this move
                }

                else if (score === bestScore) {
                    bestMoves.push(i); // Add this move as another best option
                }
            }
        }
        // Optionally, prioritize the earliest win
        if (bestScore === 1) {
            return bestMoves.find(move => {
                const tempBoard = [...board];
                tempBoard[move] = computerPlayer.symbol;
                return getWinner(tempBoard) === computerPlayer.symbol;
            }) || bestMoves[0];
        }
        
        // Adjust based on difficulty
        if (Math.random() > botDifficulty) {
            const validMoves = allMoves.filter(move => board[move] === '');     // Ensure moves are valid
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
    
        // Otherwise, just return the first best move found
        return bestMoves[0];
    };

    // Destructure the winning conditions then check if a player has occupied all three squares
    const getWinner = (board) => {
        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        return board.includes('') ? null : 'tie';
    }

    // Switch to the other player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? computerPlayer : player1;
        DisplayController.updateTurnMessage(currentPlayer);
    };
    
    // Play a turn at a specific index
    const playTurn = (index) => {
        console.log('Player:', currentPlayer.name); // Log current player

        if (!isGameOver && Gameboard.setSquare(index, currentPlayer.symbol)) {
            // Check if the game has a winner or if it's a tie
            const winner = getWinner(Gameboard.getBoard());
            if (winner) {
                isGameOver = true;
                DisplayController.updateResultMessage(winner); // Update result message for winner
                DisplayController.updateTurnMessage(currentPlayer);    
            } else {
                // If no winner, switch player
                switchPlayer();
                DisplayController.updateDisplay(); // Refresh the board display
                DisplayController.updateTurnMessage(currentPlayer);

                // If the new current player is a computer, make its move
                if (currentPlayer.isComputer) {
                    setTimeout(() => {
                        playTurn(getBestMove()); // Bot makes a move
                        DisplayController.updateDisplay(); // Refresh the board after bot's move
                        DisplayController.updateTurnMessage(currentPlayer);
                    }, 1000); // 1 second delay before bot moves
                }
            }
        } else {
            console.log('Invalid move or game over'); // Log invalid move or game over status
        }
    };

    // Reset the game to its initial state
    const resetGame = () => {
        Gameboard.resetBoard();
        isGameOver = false;
        currentPlayer = player1;
        DisplayController.updateTurnMessage(currentPlayer);
        DisplayController.updateResultMessage('');
    };

    const getGameOverStatus = () => isGameOver;
    const getCurrentPlayer = () => currentPlayer;

    return { playTurn, resetGame, getGameOverStatus, getCurrentPlayer };
})();


// Display Controller Module, responsible for updating the objects inside the DOM and handling user interactions
const DisplayController = (() => {
    const gameboardDiv = document.getElementById('gameboard');
    const restartButton = document.getElementById('restart-btn');
    const resutlMessage = document.getElementById('result');

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

    // Function to update the current player's turn message
    const updateTurnMessage = (player) => {
        const playerTurnMessage = document.getElementById('turn');

        if (GameController.getGameOverStatus()) {
            playerTurnMessage.textContent = 'Game Over. Press RESTART'
        }

        else {
            playerTurnMessage.textContent = `It's ${player.name}'s turn.`;
        }
    };

    // Function to update the result message
    const updateResultMessage = (result) => {
        if (result === 'tie') {
            resutlMessage.textContent = 'It\'s a tie!';
        }

        else if (result === 'X') {
            resutlMessage.textContent = 'Player 1 wins!';
        }

        else if (result === 'O') {
            resutlMessage.textContent = 'Player 2 wins!';
        }

        else {
            resutlMessage.textContent = '';
        }
    };


    // Set up the restart button to reset the game
    const setupRestartButton = () => {
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked'); // Log restart button click
            GameController.resetGame();
            updateDisplay();
        });
    };

    // Function to disable interactions
    const setDisabledState = (isDisabled) => {
        if (isDisabled) {
            gameboardDiv.classList.add('disabled');
        }

        else {
            gameboardDiv.classList.remove('disabled');
        }
    };

    // Initialize the game display
    const initialize = () => {
        updateDisplay();
        setupRestartButton();
        updateTurnMessage(GameController.getCurrentPlayer());
    };

    return { initialize, updateTurnMessage, updateDisplay, setDisabledState, updateResultMessage };
})();

// Initialize the game when the page loads
DisplayController.initialize();
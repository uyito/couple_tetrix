// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    '#FF6B9D', // Pink
    '#C44569', // Dark Pink
    '#FFA07A', // Light Salmon
    '#FF69B4', // Hot Pink
    '#FFB6C1', // Light Pink
    '#FF1493', // Deep Pink
    '#DB7093'  // Pale Violet Red
];

// Love statements (4 words each) - randomly selected for each piece
const LOVE_STATEMENTS = [
    ['I', 'Love', 'You', 'Always'],
    ['You', 'And', 'Me', 'Forever'],
    ['Kiss', 'Me', 'My', 'Love'],
    ['Love', 'You', 'So', 'Much'],
    ['You', 'Make', 'Me', 'Smile'],
    ['Forever', 'And', 'Ever', 'Yours'],
    ['My', 'One', 'True', 'Love'],
    ['You', 'Are', 'My', 'Everything'],
    ['I', 'Need', 'You', 'Always'],
    ['Together', 'Forever', 'My', 'Love'],
    ['You', 'Complete', 'Me', 'Darling'],
    ['Love', 'Of', 'My', 'Life'],
    ['Always', 'And', 'Forever', 'Yours'],
    ['You', 'Are', 'My', 'World'],
    ['I', 'Cherish', 'You', 'Forever']
];

// Level configurations
const LEVEL_CONFIG = [
    { name: 'Puppy Love', speed: 1000, colors: ['#FF6B9D', '#C44569', '#FFA07A', '#FF69B4', '#FFB6C1', '#FF1493', '#DB7093'] },
    { name: 'First Date', speed: 900, colors: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#FF6B9D', '#C44569', '#DB7093'] },
    { name: 'Falling Hard', speed: 800, colors: ['#E74C3C', '#C0392B', '#FF6B6B', '#EE5A6F', '#D64161', '#C44569', '#922B3E'] },
    { name: 'Deep Love', speed: 700, colors: ['#9B59B6', '#8E44AD', '#BE7BB3', '#D291BC', '#BA68C8', '#AB47BC', '#9C27B0'] },
    { name: 'Soulmates', speed: 600, colors: ['#E91E63', '#C2185B', '#F06292', '#EC407A', '#D81B60', '#AD1457', '#880E4F'] },
    { name: 'Forever Love', speed: 500, colors: ['#FF4081', '#F50057', '#FF80AB', '#FF5252', '#D500F9', '#E040FB', '#EA80FC'] },
    { name: 'Eternal Bliss', speed: 400, colors: ['#FF0080', '#D500F9', '#FF1744', '#F50057', '#D500F9', '#AA00FF', '#C51162'] },
    { name: 'True Love', speed: 300, colors: ['#C51162', '#AD1457', '#D500F9', '#AA00FF', '#6A1B9A', '#4A148C', '#E91E63'] },
    { name: 'Infinite Love', speed: 200, colors: ['#880E4F', '#4A148C', '#311B92', '#1A237E', '#D500F9', '#651FFF', '#6200EA'] },
    { name: 'Love Eternal', speed: 100, colors: ['#4A148C', '#311B92', '#1A237E', '#0D47A1', '#AA00FF', '#6200EA', '#304FFE'] }
];

// Tetromino shapes (standard Tetris pieces)
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

// Game state
let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let boardText = []; // Store text for each cell
let score = 0;
let level = 1;
let lines = 0;
let gameLoop;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let currentPiece;
let nextPiece;
let gameRunning = false;
let gamePaused = false;

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Piece class
class Piece {
    constructor(shape, color, statement) {
        this.shape = shape;
        this.color = color;
        this.statement = statement;
        this.x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
        this.y = 0;
    }

    draw(context, offsetX = 0, offsetY = 0, blockSize = BLOCK_SIZE) {
        context.fillStyle = this.color;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;

        // Count blocks and assign words
        let blockIndex = 0;
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    const x = (this.x + col) * blockSize + offsetX;
                    const y = (this.y + row) * blockSize + offsetY;

                    // Draw block with gradient
                    const gradient = context.createLinearGradient(x, y, x + blockSize, y + blockSize);
                    gradient.addColorStop(0, this.color);
                    gradient.addColorStop(1, this.adjustBrightness(this.color, -20));

                    context.fillStyle = gradient;
                    context.fillRect(x, y, blockSize, blockSize);
                    context.strokeRect(x, y, blockSize, blockSize);

                    // Draw one word per block
                    if (this.statement && this.statement[blockIndex]) {
                        context.fillStyle = '#ffffff';
                        context.font = `bold ${blockSize / 4}px Arial`;
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(this.statement[blockIndex], x + blockSize / 2, y + blockSize / 2);
                    }
                    blockIndex++;
                }
            }
        }
    }

    adjustBrightness(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    rotate() {
        const rotated = this.shape[0].map((_, i) =>
            this.shape.map(row => row[i]).reverse()
        );
        const previousShape = this.shape;
        this.shape = rotated;

        if (this.collision()) {
            this.shape = previousShape;
        }
    }

    collision() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    const newX = this.x + col;
                    const newY = this.y + row;

                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }

                    if (newY >= 0 && board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    move(dir) {
        this.x += dir;
        if (this.collision()) {
            this.x -= dir;
            return false;
        }
        return true;
    }

    drop() {
        this.y++;
        if (this.collision()) {
            this.y--;
            return false;
        }
        return true;
    }

    hardDrop() {
        while (this.drop()) {}
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');

    // Initialize board
    for (let row = 0; row < ROWS; row++) {
        board[row] = Array(COLS).fill(0);
        boardText[row] = Array(COLS).fill(null);
    }

    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.addEventListener('keydown', handleKeyPress);

    // Mobile button controls
    document.getElementById('leftBtn').addEventListener('click', () => {
        if (gameRunning && !gamePaused) {
            currentPiece.move(-1);
            draw();
        }
    });

    document.getElementById('rightBtn').addEventListener('click', () => {
        if (gameRunning && !gamePaused) {
            currentPiece.move(1);
            draw();
        }
    });

    document.getElementById('downBtn').addEventListener('click', () => {
        if (gameRunning && !gamePaused) {
            if (currentPiece.drop()) {
                score += 1;
                updateScore();
            }
            dropCounter = 0;
            draw();
        }
    });

    document.getElementById('rotateBtn').addEventListener('click', () => {
        if (gameRunning && !gamePaused) {
            currentPiece.rotate();
            draw();
        }
    });

    document.getElementById('dropBtn').addEventListener('click', () => {
        if (gameRunning && !gamePaused) {
            currentPiece.hardDrop();
            merge();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createRandomPiece();
            drawNextPiece();

            if (currentPiece.collision()) {
                gameOver();
            }
            score += 10;
            updateScore();
            dropCounter = 0;
            draw();
        }
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        togglePause();
    });

    document.getElementById('pauseBarBtn').addEventListener('click', () => {
        togglePause();
    });

    document.getElementById('restartFromPauseBtn').addEventListener('click', () => {
        gamePaused = false;
        document.getElementById('pauseScreen').classList.add('hidden');
        const pauseBarBtn = document.getElementById('pauseBarBtn');
        pauseBarBtn.textContent = '⏸ Pause';
        restartGame();
    });

    // Touch swipe controls on canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gamePauseBar').classList.remove('hidden');

    // Enter fullscreen mode
    enterFullscreen();

    gameRunning = true;
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;

    // Clear board
    for (let row = 0; row < ROWS; row++) {
        board[row] = Array(COLS).fill(0);
        boardText[row] = Array(COLS).fill(null);
    }

    currentPiece = createRandomPiece();
    nextPiece = createRandomPiece();

    updateScore();
    drawNextPiece();

    lastTime = 0;
    gameLoop = requestAnimationFrame(update);
}

function enterFullscreen() {
    document.body.classList.add('fullscreen');

    // Try to use browser fullscreen API
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log('Fullscreen not available, using CSS fullscreen instead');
        });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    document.body.classList.remove('fullscreen');

    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {});
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function restartGame() {
    document.getElementById('gameOver').classList.add('hidden');
    startGame();
}

function createRandomPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const statementIndex = Math.floor(Math.random() * LOVE_STATEMENTS.length);
    const currentLevelConfig = LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)];
    return new Piece(
        JSON.parse(JSON.stringify(SHAPES[shapeIndex])),
        currentLevelConfig.colors[shapeIndex],
        LOVE_STATEMENTS[statementIndex]
    );
}

function update(time = 0) {
    if (!gameRunning || gamePaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        if (!currentPiece.drop()) {
            merge();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createRandomPiece();
            drawNextPiece();

            if (currentPiece.collision()) {
                gameOver();
                return;
            }
        }
        dropCounter = 0;
    }

    draw();
    gameLoop = requestAnimationFrame(update);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, row * BLOCK_SIZE);
        ctx.stroke();
    }
    for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        ctx.moveTo(col * BLOCK_SIZE, 0);
        ctx.lineTo(col * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }

    // Draw board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

                // Draw text on merged blocks
                if (boardText[row][col]) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold ${BLOCK_SIZE / 4}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(boardText[row][col], col * BLOCK_SIZE + BLOCK_SIZE / 2, row * BLOCK_SIZE + BLOCK_SIZE / 2);
                }
            }
        }
    }

    // Draw current piece
    currentPiece.draw(ctx);
}

function drawNextPiece() {
    nextCtx.fillStyle = '#f5f5f5';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const offsetX = (nextCanvas.width - nextPiece.shape[0].length * 25) / 2;
    const offsetY = (nextCanvas.height - nextPiece.shape.length * 25) / 2;

    nextCtx.fillStyle = nextPiece.color;
    nextCtx.strokeStyle = '#ffffff';
    nextCtx.lineWidth = 2;

    let blockIndex = 0;
    for (let row = 0; row < nextPiece.shape.length; row++) {
        for (let col = 0; col < nextPiece.shape[row].length; col++) {
            if (nextPiece.shape[row][col]) {
                const x = col * 25 + offsetX;
                const y = row * 25 + offsetY;
                nextCtx.fillRect(x, y, 25, 25);
                nextCtx.strokeRect(x, y, 25, 25);

                // Draw one word per block
                if (nextPiece.statement && nextPiece.statement[blockIndex]) {
                    nextCtx.fillStyle = '#ffffff';
                    nextCtx.font = 'bold 5px Arial';
                    nextCtx.textAlign = 'center';
                    nextCtx.textBaseline = 'middle';
                    nextCtx.fillText(nextPiece.statement[blockIndex], x + 12.5, y + 12.5);
                    nextCtx.fillStyle = nextPiece.color;
                }
                blockIndex++;
            }
        }
    }
}

function merge() {
    let blockIndex = 0;
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const boardY = currentPiece.y + row;
                const boardX = currentPiece.x + col;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                    boardText[boardY][boardX] = currentPiece.statement[blockIndex];
                }
                blockIndex++;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;

    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            boardText.splice(row, 1);
            boardText.unshift(Array(COLS).fill(null));
            linesCleared++;
            row++; // Check the same row again
        }
    }

    if (linesCleared > 0) {
        const previousLevel = level;
        lines += linesCleared;
        score += linesCleared * 100 * level;

        // Level up every 10 lines
        level = Math.floor(lines / 10) + 1;
        const currentLevelConfig = LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)];
        dropInterval = currentLevelConfig.speed;

        // Show level up notification
        if (level > previousLevel) {
            showLevelUpNotification();
        }

        updateScore();
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
    const currentLevelConfig = LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)];
    document.getElementById('levelName').textContent = currentLevelConfig.name;
}

function showLevelUpNotification() {
    const notification = document.getElementById('levelUpNotification');
    const currentLevelConfig = LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)];
    document.getElementById('levelUpName').textContent = currentLevelConfig.name;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    const pauseScreen = document.getElementById('pauseScreen');
    const pauseBarBtn = document.getElementById('pauseBarBtn');

    if (gamePaused) {
        pauseScreen.classList.remove('hidden');
        cancelAnimationFrame(gameLoop);
        pauseBarBtn.textContent = '▶ Resume';
    } else {
        pauseScreen.classList.add('hidden');
        lastTime = performance.now();
        dropCounter = 0;
        gameLoop = requestAnimationFrame(update);
        pauseBarBtn.textContent = '⏸ Pause';
    }
}

function handleKeyPress(e) {
    if (!gameRunning) return;

    // P key to pause/unpause
    if (e.keyCode === 80) {
        togglePause();
        return;
    }

    if (gamePaused) return;

    switch (e.keyCode) {
        case 37: // Left
            currentPiece.move(-1);
            draw();
            break;
        case 39: // Right
            currentPiece.move(1);
            draw();
            break;
        case 40: // Down
            if (currentPiece.drop()) {
                score += 1;
                updateScore();
            }
            dropCounter = 0;
            draw();
            break;
        case 38: // Up (rotate)
            currentPiece.rotate();
            draw();
            break;
        case 32: // Space (hard drop)
            e.preventDefault();
            currentPiece.hardDrop();
            merge();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createRandomPiece();
            drawNextPiece();

            if (currentPiece.collision()) {
                gameOver();
            }
            score += 10;
            updateScore();
            dropCounter = 0;
            draw();
            break;
    }
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('gamePauseBar').classList.add('hidden');
    exitFullscreen();
}

// Touch gesture handlers
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!gameRunning || gamePaused) return;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right
                currentPiece.move(1);
            } else {
                // Swipe left
                currentPiece.move(-1);
            }
            draw();
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                // Swipe down - soft drop
                if (currentPiece.drop()) {
                    score += 1;
                    updateScore();
                }
                dropCounter = 0;
            } else {
                // Swipe up - rotate
                currentPiece.rotate();
            }
            draw();
        } else {
            // Tap - hard drop
            currentPiece.hardDrop();
            merge();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createRandomPiece();
            drawNextPiece();

            if (currentPiece.collision()) {
                gameOver();
                return;
            }
            score += 10;
            updateScore();
            dropCounter = 0;
            draw();
        }
    }

    // Reset touch coordinates
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
}

// Initialize when page loads
window.addEventListener('load', init);

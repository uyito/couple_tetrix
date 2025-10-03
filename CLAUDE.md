# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Love Tetris** game - a themed Tetris clone with romantic messages displayed on game pieces. It's a standalone browser-based game with no build system or dependencies, built with vanilla JavaScript, HTML5 Canvas, and CSS.

## Running the Game

Simply open `index.html` in a web browser. No build step or server required.

## Code Architecture

### File Structure
- `index.html` - Main HTML structure with game canvas, UI panels, and overlays
- `game.js` - Complete game logic (408 lines)
- `styles.css` - Styling with gradient backgrounds and responsive layout

### Core Components (game.js)

**Game State**
- Board: 10x20 grid (COLS × ROWS), block size 30px
- State variables: `board`, `score`, `level`, `lines`, `currentPiece`, `nextPiece`, `gameRunning`
- Two canvases: main game canvas (300×600) and next piece preview (120×120)

**Piece Class (lines 52-156)**
- Properties: `shape` (2D array), `color`, `statement` (love message), `x`, `y` position
- Methods: `draw()`, `rotate()`, `collision()`, `move()`, `drop()`, `hardDrop()`
- Each piece displays a love statement ("Love U", "Be Mine", etc.) on its center block
- 7 standard Tetromino shapes (I, O, T, L, J, S, Z) with corresponding pink/salmon colors

**Game Loop (lines 213-238)**
- Uses `requestAnimationFrame` for smooth rendering
- Drop interval decreases with level (starts at 1000ms, reduces by 100ms per level, min 100ms)
- Flow: drop piece → merge on collision → clear lines → spawn next piece → check game over

**Key Functions**
- `init()` (line 159): Initialize canvases, board, event listeners
- `startGame()` (line 176): Reset state, create pieces, start game loop
- `update()` (line 213): Main game loop with delta time and auto-drop
- `draw()` (line 240): Renders grid, board, and current piece
- `merge()` (line 311): Locks piece into board
- `clearLines()` (line 325): Removes completed rows, updates score/level
- `handleKeyPress()` (line 355): Controls - Arrow keys (move/rotate), Space (hard drop)

**Scoring System**
- Lines cleared: 100 points × lines cleared × level
- Soft drop (↓): 1 point per row
- Hard drop (Space): 10 points
- Level up: Every 10 lines cleared

### Visual Design
- Pink/salmon color palette (`#FF6B9D`, `#C44569`, etc.)
- Gradient backgrounds and blocks with brightness adjustments
- Dark game board (`#1a1a2e`) with subtle grid lines
- Responsive layout with media queries for mobile (<600px)

## Development Notes

**Adding New Piece Shapes**
- Add shape to `SHAPES` array (2D array, 1=filled, 0=empty)
- Add matching color to `COLORS` array
- Add matching message to `LOVE_STATEMENTS` array
- All three arrays must remain synchronized by index

**Game Constants**
- Modify `COLS`, `ROWS`, or `BLOCK_SIZE` to change board dimensions
- Update canvas dimensions in `index.html` accordingly (width = COLS × BLOCK_SIZE, height = ROWS × BLOCK_SIZE)

**Controls**
- Keyboard events handled in `handleKeyPress()` using keyCodes (37-40 for arrows, 32 for space)
- Add new controls by extending the switch statement

**Collision Detection**
- `collision()` method checks boundaries and board state
- Called after any movement/rotation attempt
- Prevents pieces from moving out of bounds or overlapping locked blocks

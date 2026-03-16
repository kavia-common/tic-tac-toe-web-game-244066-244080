import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const BOARD_SIZE = 3;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

/**
 * Returns an array of winning line indices for an NxN board.
 * For 3x3, this yields 8 lines (3 rows, 3 cols, 2 diagonals).
 */
function getWinningLines(size) {
  /** @type {number[][]} */
  const lines = [];

  // Rows
  for (let r = 0; r < size; r += 1) {
    const row = [];
    for (let c = 0; c < size; c += 1) row.push(r * size + c);
    lines.push(row);
  }

  // Columns
  for (let c = 0; c < size; c += 1) {
    const col = [];
    for (let r = 0; r < size; r += 1) col.push(r * size + c);
    lines.push(col);
  }

  // Diagonals
  const diag1 = [];
  const diag2 = [];
  for (let i = 0; i < size; i += 1) {
    diag1.push(i * size + i);
    diag2.push(i * size + (size - 1 - i));
  }
  lines.push(diag1, diag2);

  return lines;
}

const WINNING_LINES = getWinningLines(BOARD_SIZE);

/**
 * Determines if there's a winner for the given board.
 * @param {(null|"X"|"O")[]} squares
 * @returns {{winner: null|"X"|"O", line: number[] | null}}
 */
function calculateWinner(squares) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
}

/**
 * @param {(null|"X"|"O")[]} squares
 * @returns {boolean}
 */
function isDraw(squares) {
  return squares.every((v) => v !== null);
}

/**
 * Human readable label for cell position (row/col).
 * @param {number} index
 * @returns {string}
 */
function cellLabel(index) {
  const row = Math.floor(index / BOARD_SIZE) + 1;
  const col = (index % BOARD_SIZE) + 1;
  return `Row ${row}, Column ${col}`;
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const [squares, setSquares] = useState(() => Array(CELL_COUNT).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [lastMove, setLastMove] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const { winner, line: winningLine } = useMemo(
    () => calculateWinner(squares),
    [squares]
  );

  const draw = useMemo(() => !winner && isDraw(squares), [winner, squares]);

  const statusText = useMemo(() => {
    if (winner) return `${winner} wins!`;
    if (draw) return "It's a draw!";
    return `Turn: ${xIsNext ? "X" : "O"}`;
  }, [winner, draw, xIsNext]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    if (winner || draw) return;
    if (squares[index] !== null) return;

    const next = squares.slice();
    next[index] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext((v) => !v);
    setLastMove(index);
  };

  // PUBLIC_INTERFACE
  const resetBoard = () => {
    setSquares(Array(CELL_COUNT).fill(null));
    setXIsNext(true);
    setLastMove(null);
  };

  // PUBLIC_INTERFACE
  const newGame = () => {
    // For now, "New game" is equivalent to reset. Kept separate for future extension
    // (e.g., score tracking, choosing first player, etc.).
    resetBoard();
  };

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <main className="ttt-shell" aria-label="Tic Tac Toe game">
          <div className="ttt-card" role="region" aria-label="Game panel">
            <div className="ttt-header">
              <div>
                <h1 className="ttt-title">Tic Tac Toe</h1>
                <p className="ttt-subtitle">Two players. One board. Zero mercy.</p>
              </div>

              <div className="ttt-badges" aria-label="Legend">
                <span className="ttt-badge ttt-badge-x" aria-label="Player X">
                  X
                </span>
                <span className="ttt-badge ttt-badge-o" aria-label="Player O">
                  O
                </span>
              </div>
            </div>

            <div className="ttt-status" role="status" aria-live="polite">
              <span
                className={[
                  "ttt-statusText",
                  winner ? "is-winner" : "",
                  draw ? "is-draw" : "",
                ].join(" ")}
              >
                {statusText}
              </span>

              {!winner && !draw ? (
                <span className="ttt-hint">
                  Click an empty square to place{" "}
                  <strong>{xIsNext ? "X" : "O"}</strong>.
                </span>
              ) : (
                <span className="ttt-hint">
                  {winner
                    ? "Press New Game to play again."
                    : "No moves left — try again?"}
                </span>
              )}
            </div>

            <div className="ttt-boardWrap">
              <div
                className="ttt-board"
                role="grid"
                aria-label="3 by 3 game board"
              >
                {squares.map((value, idx) => {
                  const isWinningCell = Boolean(
                    winningLine && winningLine.includes(idx)
                  );
                  const isLastMove = lastMove === idx;

                  const aria =
                    value === null
                      ? `Empty. ${cellLabel(idx)}. Click to place ${
                          xIsNext ? "X" : "O"
                        }.`
                      : `${value}. ${cellLabel(idx)}.`;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={[
                        "ttt-cell",
                        value ? `is-${value}` : "",
                        isWinningCell ? "is-winning" : "",
                        isLastMove ? "is-lastMove" : "",
                      ].join(" ")}
                      onClick={() => handleSquareClick(idx)}
                      disabled={Boolean(winner || draw || value !== null)}
                      role="gridcell"
                      aria-label={aria}
                    >
                      <span className="ttt-cellInner" aria-hidden="true">
                        {value ?? ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ttt-controls" aria-label="Controls">
              <button
                type="button"
                className="ttt-btn ttt-btn-secondary"
                onClick={resetBoard}
              >
                Reset Board
              </button>
              <button
                type="button"
                className="ttt-btn ttt-btn-primary"
                onClick={newGame}
              >
                New Game
              </button>
            </div>

            <footer className="ttt-footer">
              <span className="ttt-footerText">
                Tip: Winning squares glow. Last move gets a subtle pulse.
              </span>
            </footer>
          </div>
        </main>
      </header>
    </div>
  );
}

export default App;

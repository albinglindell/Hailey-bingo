import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  FloatButton,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import "antd/dist/reset.css";
import Confetti from "react-confetti";
import questionsData from "./questions.json";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

type BingoCell = {
  question: string;
  checked: boolean;
};

type Question = {
  id: number;
  question: string;
};

const SECONDARY_COLOR = "#ffb2b2";
const LOCAL_STORAGE_KEY = "bingo-board-state";
const THEME_KEY = "bingo-theme";

const mapThemeToIcon: Record<"light" | "dark", React.ReactNode> = {
  light: <BulbOutlined />,
  dark: <BulbFilled style={{ color: "#ffd700" }} />,
};

const getInitialTheme = (): "light" | "dark" => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )
    return "dark";
  return "light";
};

const getInitialBoard = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Check if the questions match the JSON file
      const flatQuestions = (questionsData as Question[]).map(
        (q) => q.question
      );
      const flatSaved = parsed.flat().map((cell: BingoCell) => cell.question);
      if (flatQuestions.every((q, i) => q === flatSaved[i])) {
        return parsed;
      }
    } catch {
      // fallback to default
    }
  }
  // Use questions from questions.json
  return Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => ({
      question: (questionsData as Question[])[row * 5 + col].question,
      checked: false,
    }))
  );
};

const App = () => {
  const [board, setBoard] = useState(() => getInitialBoard());
  const [modal, setModal] = useState(() => ({
    open: false,
    question: "",
    row: -1,
    col: -1,
  }));
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme());

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const onSearchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(() => e.target.value);
  };

  const onCellClickHandler = (row: number, col: number) => {
    setModal(() => ({
      open: true,
      question: board[row][col].question,
      row,
      col,
    }));
  };

  const onCellKeyDownHandler = (
    row: number,
    col: number,
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      onCellClickHandler(row, col);
    }
  };

  const onModalCloseHandler = () => {
    setModal(() => ({ open: false, question: "", row: -1, col: -1 }));
  };

  const onModalCheckHandler = () => {
    if (modal.row === -1 || modal.col === -1) return;
    setBoard((prev: BingoCell[][]) =>
      prev.map((r: BingoCell[], rIdx: number) =>
        rIdx !== modal.row
          ? r
          : r.map((cell: BingoCell, cIdx: number) =>
              cIdx !== modal.col ? cell : { ...cell, checked: !cell.checked }
            )
      )
    );
    setModal((prev) => ({ ...prev, open: false }));
  };

  const onThemeToggleHandler = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isBingo = (board: BingoCell[][]): boolean => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (board[i].every((cell) => cell.checked)) return true;
    }
    // Check columns
    for (let j = 0; j < 5; j++) {
      if (board.every((row) => row[j].checked)) return true;
    }
    // Check diagonals
    if (board.every((row, idx) => row[idx].checked)) return true;
    if (board.every((row, idx) => row[4 - idx].checked)) return true;
    return false;
  };

  const bingoCompleted = isBingo(board);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
          background: theme === "dark" ? "#18191a" : "#f6f7fb",
          fontFamily: "Inter, Arial, sans-serif",
          padding: 0,
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s",
        }}
      >
        {bingoCompleted && (
          <Confetti
            style={{ zIndex: 1000 }}
            width={window.innerWidth}
            height={window.innerHeight}
            colors={[
              "#f0f0f0",
              "#e0e0e0",
              SECONDARY_COLOR,
              "#ffe5e4",
              "#f28189",
              "#ef616b",
            ]}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            boxSizing: "border-box",
            background: theme === "dark" ? "#111113" : undefined,
          }}
        >
          <div
            style={{
              background: theme === "dark" ? "#232325" : "#fff",
              borderRadius: 24,
              boxShadow:
                theme === "dark"
                  ? "0 2px 16px 0 rgba(0,0,0,0.7)"
                  : "0 4px 24px 0 rgba(0,0,0,0.06)",
              width: "100%",
              height: "100%",
              maxWidth: 700,
              maxHeight: 700,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              border: theme === "dark" ? "1px solid #232325" : undefined,
              transition: "background 0.3s",
            }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                marginBottom: 24,
                color: SECONDARY_COLOR,
              }}
            >
              Hailey Bingo
            </h1>
            <Input
              placeholder="Search a question..."
              value={search}
              onChange={onSearchChangeHandler}
              style={{
                marginBottom: 20,
                borderRadius: 12,
                fontSize: 16,
                padding: 8,
                width: "100%",
                maxWidth: 340,
                boxShadow: "none",
                outline: "none",
                background: theme === "dark" ? "#18181a" : "#fff",
                color: theme === "dark" ? "#fff" : "#222",
                border: theme === "dark" ? "1px solid #232325" : undefined,
                transition: "background 0.3s, color 0.3s",
              }}
              allowClear
              aria-label="Search a question..."
              onFocus={(e) =>
                (e.target.style.boxShadow = `0 0 0 2px ${SECONDARY_COLOR}`)
              }
              onBlur={(e) => (e.target.style.boxShadow = "")}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gridTemplateRows: "repeat(5, 1fr)",
                gap: 12,
                width: "100%",
                aspectRatio: 1,
                maxWidth: 600,
                maxHeight: 600,
                boxSizing: "border-box",
              }}
            >
              {board.map((row: BingoCell[], rowIdx: number) =>
                row.map((cell: BingoCell, colIdx: number) => {
                  const searchText = search.trim().toLowerCase();
                  if (
                    searchText &&
                    !cell.question.toLowerCase().includes(searchText)
                  ) {
                    return null;
                  }
                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      tabIndex={0}
                      aria-label={`Bingo cell ${rowIdx * 5 + colIdx + 1}: ${
                        cell.question
                      }`}
                      role="button"
                      onClick={() => onCellClickHandler(rowIdx, colIdx)}
                      onKeyDown={(e) => onCellKeyDownHandler(rowIdx, colIdx, e)}
                      style={{
                        border: theme === "dark" ? "1px solid #232325" : "none",
                        background: cell.checked
                          ? SECONDARY_COLOR
                          : theme === "dark"
                          ? "#18181a"
                          : "#f6f7fb",
                        color: cell.checked
                          ? "#000"
                          : theme === "dark"
                          ? "#fff"
                          : "#222",
                        borderRadius: 16,
                        boxShadow: cell.checked
                          ? `0 2px 8px 0 ${SECONDARY_COLOR}33`
                          : theme === "dark"
                          ? "0 1px 4px 0 rgba(0,0,0,0.7)"
                          : "0 1px 4px 0 rgba(0,0,0,0.04)",
                        minHeight: 0,
                        width: "100%",
                        aspectRatio: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        outline: "none",
                        fontWeight: 500,
                        fontSize: 12,
                        userSelect: "none",
                        padding: 6,
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        transition:
                          "background 0.2s, color 0.2s, box-shadow 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = cell.checked
                          ? SECONDARY_COLOR
                          : theme === "dark"
                          ? "#232325"
                          : "#eceef3")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = cell.checked
                          ? SECONDARY_COLOR
                          : theme === "dark"
                          ? "#18181a"
                          : "#f6f7fb")
                      }
                    >
                      {rowIdx * 5 + colIdx + 1}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <Modal open={modal.open} onCancel={onModalCloseHandler} footer={null}>
            <div
              style={{
                width: "100%",
                maxWidth: 340,
                aspectRatio: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 24,
                  textAlign: "center",
                  width: "100%",
                  color: SECONDARY_COLOR,
                }}
              >
                {modal.row !== -1 && modal.col !== -1
                  ? board[modal.row][modal.col].question
                  : ""}
              </div>
              <div style={{ display: "flex", gap: 12, width: "100%" }}>
                <Button
                  type="primary"
                  block
                  onClick={onModalCheckHandler}
                  style={{
                    background: SECONDARY_COLOR,
                    borderColor: SECONDARY_COLOR,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#e18b8b")
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.background = "#e18b8b")
                  }
                >
                  {modal.row !== -1 &&
                  modal.col !== -1 &&
                  board[modal.row][modal.col].checked
                    ? "Uncheck"
                    : "Check"}
                </Button>
                <Button block onClick={onModalCloseHandler}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
          <FloatButton
            onClick={onThemeToggleHandler}
            icon={mapThemeToIcon[theme]}
            type="primary"
            style={{ right: 32, bottom: 32 }}
            className="custom-float-btn"
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default App;

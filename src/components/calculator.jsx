import { useState, useEffect, useCallback, useMemo } from "react";
import "../styles.css";

export default function Calculator() {
  const [input, setInput] = useState("0");
  const [formula, setFormula] = useState("");
  const [evaluated, setEvaluated] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  const isOperator = useMemo(() => /[+\-*/]/, []);

  // Number input
  const handleNumber = useCallback((num) => {
    if (evaluated) {
      setInput(num);
      setFormula(num);
      setEvaluated(false);
      setError("");
    } else {
      setInput(input === "0" || isOperator.test(input) ? num : input + num);
      setFormula((prev) => (prev === "0" ? num : prev + num));
    }
  }, [evaluated, input, isOperator]);

  // Operator input
  const handleOperator = useCallback((op) => {
    if (evaluated) {
      setFormula(input + op);
      setInput(op);
      setEvaluated(false);
      setError("");
      return;
    }

    if (/[+\-*/]$/.test(formula)) {
      if (op === "-" && !/[-]$/.test(formula)) {
        setFormula(formula + op);
      } else {
        setFormula(formula.replace(/[+\-*/]+$/, op));
      }
    } else {
      setFormula(formula + op);
    }

    setInput(op);
  }, [evaluated, input, formula]);

  // Decimal
  const handleDecimal = useCallback(() => {
    if (evaluated) {
      setInput("0.");
      setFormula("0.");
      setEvaluated(false);
      setError("");
    } else if (!input.includes(".")) {
      setInput(input + ".");
      setFormula(formula + ".");
    }
  }, [evaluated, input, formula]);

  // Clear
  const handleClear = () => {
    setInput("0");
    setFormula("");
    setEvaluated(false);
    setError("");
  };

  // Equals
  const handleEquals = useCallback(() => {
    let exp = formula.replace(/[*+\-/]+$/, ""); 
    try {
      const result = Math.round(eval(exp) * 100000) / 100000;
      setInput(String(result));
      setFormula(`${exp} = ${result}`);
      setEvaluated(true);
      setError("");
      setHistory([`${exp} = ${result}`, ...history]);
    } catch {
      setInput("Error");
      setError("Invalid expression");
      setEvaluated(true);
    }
  }, [formula, history]);

  // Dark/Light Mode toggle
  const toggleTheme = () => setDarkMode(!darkMode);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (!isNaN(key)) handleNumber(key);
      else if (["+","-","*","/"].includes(key)) handleOperator(key);
      else if (key === "Enter") handleEquals();
      else if (key === "Backspace") handleClear();
      else if (key === ".") handleDecimal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, formula, evaluated, handleNumber, handleOperator, handleEquals, handleDecimal]);

  return (
    <div id="calculator" className={darkMode ? "dark" : "light"}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>

      {error && <div className="error">{error}</div>}

      <div id="formula" className="formula-display">{formula}</div>
      <div id="display" className="display">{input}</div>

      <div className="keypad">
        <button id="clear" onClick={handleClear}>AC</button>
        <button id="divide" onClick={() => handleOperator("/")}>/</button>
        <button id="multiply" onClick={() => handleOperator("*")}>*</button>

        <button id="seven" onClick={() => handleNumber("7")}>7</button>
        <button id="eight" onClick={() => handleNumber("8")}>8</button>
        <button id="nine" onClick={() => handleNumber("9")}>9</button>
        <button id="subtract" onClick={() => handleOperator("-")}>-</button>

        <button id="four" onClick={() => handleNumber("4")}>4</button>
        <button id="five" onClick={() => handleNumber("5")}>5</button>
        <button id="six" onClick={() => handleNumber("6")}>6</button>
        <button id="add" onClick={() => handleOperator("+")}>+</button>

        <button id="one" onClick={() => handleNumber("1")}>1</button>
        <button id="two" onClick={() => handleNumber("2")}>2</button>
        <button id="three" onClick={() => handleNumber("3")}>3</button>
        <button id="equals" onClick={handleEquals}>=</button>

        <button id="zero" onClick={() => handleNumber("0")} className="zero">0</button>
        <button id="decimal" onClick={handleDecimal}>.</button>
      </div>

      <div className="history">
        <h3>History</h3>
        {history.length === 0 ? <div>No calculations yet</div> :
          history.map((item, idx) => <div key={idx}>{item}</div>)
        }
      </div>
    </div>
  );
}

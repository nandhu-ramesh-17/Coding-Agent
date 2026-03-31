// scripts/app.js
// Calculator utility providing basic arithmetic operations and expression evaluation.

/**
 * Simple Calculator class offering arithmetic methods and a safe expression evaluator.
 */
class Calculator {
  /**
   * Add two numbers.
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  add(a, b) {
    return a + b;
  }

  /**
   * Subtract b from a.
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  subtract(a, b) {
    return a - b;
  }

  /**
   * Multiply a and b.
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  multiply(a, b) {
    return a * b;
  }

  /**
   * Divide a by b.
   * @param {number} a
   * @param {number} b
   * @returns {number}
   * @throws {Error} When dividing by zero.
   */
  divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }

  /**
   * Evaluate a simple arithmetic expression.
   * Supports numbers and the operators +, -, *, / as well as the Unicode
   * multiplication (×) and division (÷) symbols.
   *
   * @param {string} expression The raw expression string.
   * @returns {string} The result of the evaluation as a string.
   * @throws {Error} If the expression contains invalid characters or a runtime error occurs.
   */
  evaluate(expression) {
    if (typeof expression !== 'string') {
      throw new Error('Invalid expression');
    }
    // Replace Unicode operators with JavaScript equivalents.
    let sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
    // Allow digits, decimal point, whitespace and basic operators only.
    const allowedPattern = /^[0-9+\-*/.\s]+$/;
    if (!allowedPattern.test(sanitized)) {
      throw new Error('Invalid expression');
    }
    try {
      // Evaluate safely using Function constructor.
      const result = Function('return ' + sanitized)();
      // Ensure result is a number.
      if (typeof result !== 'number' || Number.isNaN(result)) {
        throw new Error('Invalid expression');
      }
      return String(result);
    } catch (e) {
      // Re‑throw as a generic invalid expression error.
      throw new Error('Invalid expression');
    }
  }
}

// UI controller – binds DOM elements to calculator actions.
const UI = (() => {
  // Cache DOM references.
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('.btn');

  // Single Calculator instance.
  const calc = new Calculator();

  // Internal expression state.
  let currentExpression = '';

  // Helper: refresh the display.
  const updateDisplay = () => {
    if (display) {
      display.value = currentExpression || '0';
    }
  };

  // Helper: determine the last operator position.
  const lastOperatorIndex = () => {
    const operators = /[+\-*/×÷]/g;
    let match;
    let lastIdx = -1;
    while ((match = operators.exec(currentExpression)) !== null) {
      lastIdx = match.index;
    }
    return lastIdx;
  };

  // Append a digit or decimal point.
  const appendDigit = (digit) => {
    if (digit === '.') {
      // Prevent multiple decimals in the current number segment.
      const lastOpIdx = lastOperatorIndex();
      const numberSegment = currentExpression.slice(lastOpIdx + 1);
      if (numberSegment.includes('.')) {
        return; // ignore additional decimal point.
      }
      // If the expression is empty, prepend a leading zero.
      if (currentExpression === '' || /[+\-*/×÷]$/.test(currentExpression)) {
        currentExpression += '0';
      }
    }
    currentExpression += digit;
    updateDisplay();
  };

  // Append an operator (+, -, *, /, ×, ÷).
  const appendOperator = (op) => {
    if (!currentExpression) {
      // Allow leading minus for negative numbers.
      if (op === '-') {
        currentExpression = '-';
        updateDisplay();
      }
      return;
    }
    const lastChar = currentExpression.slice(-1);
    if (/[0-9.]$/.test(lastChar)) {
      currentExpression += op;
      updateDisplay();
    }
    // If last char is an operator, replace it with the new one.
    else if (/[+\-*/×÷]$/.test(lastChar)) {
      currentExpression = currentExpression.slice(0, -1) + op;
      updateDisplay();
    }
  };

  const clearAll = () => {
    currentExpression = '';
    updateDisplay();
  };

  const backspace = () => {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
  };

  const calculateResult = () => {
    try {
      const result = calc.evaluate(currentExpression);
      currentExpression = result;
    } catch (e) {
      currentExpression = 'Error';
    }
    updateDisplay();
  };

  // Attach click listeners to buttons.
  buttons.forEach((button) => {
    const action = button.dataset.action;
    if (!action) return;
    button.addEventListener('click', () => {
      switch (action) {
        case 'digit':
          appendDigit(button.textContent.trim());
          break;
        case 'operator':
          const op = button.dataset.operator || button.textContent.trim();
          appendOperator(op);
          break;
        case 'clear':
          clearAll();
          break;
        case 'backspace':
          backspace();
          break;
        case 'equals':
          calculateResult();
          break;
        default:
          // No-op for unknown actions.
          break;
      }
    });
  });

  // Initialise display.
  updateDisplay();

  // Public API (exposed via window.UI).
  return {
    appendDigit,
    appendOperator,
    clearAll,
    backspace,
    calculateResult,
    getExpression: () => currentExpression,
    setExpression: (expr) => { currentExpression = expr; updateDisplay(); },
    updateDisplay,
  };
})();

// Expose UI globally for other scripts (e.g., keyboard handler).
if (typeof window !== 'undefined') {
  window.UI = UI;
}

// KeyboardHandler module – forwards keyboard events to UI actions.
const KeyboardHandler = (() => {
  const keyMap = {
    '0': '0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
    '.': '.',
    '+': '+', '-': '-', '*': '*', 'x': '*', 'X': '*', '/': '/', '÷': '/',
    'Enter': '=', '=': '=',
    'Backspace': 'backspace',
    'Escape': 'clear', 'c': 'clear', 'C': 'clear'
  };
  const handleKey = (e) => {
    const action = keyMap[e.key];
    if (!action) return;
    e.preventDefault();
    switch(action) {
      case 'clear': UI.clearAll(); break;
      case 'backspace': UI.backspace(); break;
      case '=': UI.calculateResult(); break;
      case '+': case '-': case '*': case '/': UI.appendOperator(action); break;
      default: UI.appendDigit(action); break;
    }
  };
  document.addEventListener('keydown', handleKey);
  return { detach: () => document.removeEventListener('keydown', handleKey) };
})();

// Export for module environments or attach to the global window object.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Calculator;
} else if (typeof define === 'function' && define.amd) {
  define(function () { return Calculator; });
} else {
  // Browser global
  window.Calculator = Calculator;
}

/**
 * A simple calculator module demonstrating testable code
 */

/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Subtracts second number from first
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The difference
 */
function subtract(a, b) {
  return a - b;
}

/**
 * Multiplies two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The product
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Divides first number by second
 * @param {number} a - Dividend
 * @param {number} b - Divisor
 * @returns {number} The quotient
 * @throws {Error} When dividing by zero
 */
function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

/**
 * Calculates the factorial of a number
 * @param {number} n - A non-negative integer
 * @returns {number} The factorial of n
 * @throws {Error} When n is negative
 */
function factorial(n) {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

/**
 * Checks if a number is prime
 * @param {number} n - A positive integer
 * @returns {boolean} True if n is prime
 */
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

module.exports = {
  add,
  subtract,
  multiply,
  divide,
  factorial,
  isPrime
};

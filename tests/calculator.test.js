const { add, subtract, multiply, divide, factorial, isPrime } = require('../src/calculator');

describe('Calculator', () => {
  describe('add', () => {
    test('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('adds negative numbers', () => {
      expect(add(-1, -1)).toBe(-2);
    });

    test('adds zero', () => {
      expect(add(5, 0)).toBe(5);
    });

    test('adds decimal numbers', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe('subtract', () => {
    test('subtracts two positive numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    test('subtracts resulting in negative', () => {
      expect(subtract(3, 5)).toBe(-2);
    });

    test('subtracts zero', () => {
      expect(subtract(5, 0)).toBe(5);
    });
  });

  describe('multiply', () => {
    test('multiplies two positive numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    test('multiplies by zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });

    test('multiplies negative numbers', () => {
      expect(multiply(-3, -4)).toBe(12);
    });

    test('multiplies positive by negative', () => {
      expect(multiply(3, -4)).toBe(-12);
    });
  });

  describe('divide', () => {
    test('divides two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    test('divides with decimal result', () => {
      expect(divide(7, 2)).toBe(3.5);
    });

    test('throws error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });

    test('divides negative numbers', () => {
      expect(divide(-10, 2)).toBe(-5);
    });
  });

  describe('factorial', () => {
    test('factorial of 0 is 1', () => {
      expect(factorial(0)).toBe(1);
    });

    test('factorial of 1 is 1', () => {
      expect(factorial(1)).toBe(1);
    });

    test('factorial of 5 is 120', () => {
      expect(factorial(5)).toBe(120);
    });

    test('throws error for negative numbers', () => {
      expect(() => factorial(-1)).toThrow('Factorial is not defined for negative numbers');
    });
  });

  describe('isPrime', () => {
    test('1 is not prime', () => {
      expect(isPrime(1)).toBe(false);
    });

    test('2 is prime', () => {
      expect(isPrime(2)).toBe(true);
    });

    test('3 is prime', () => {
      expect(isPrime(3)).toBe(true);
    });

    test('4 is not prime', () => {
      expect(isPrime(4)).toBe(false);
    });

    test('17 is prime', () => {
      expect(isPrime(17)).toBe(true);
    });

    test('25 is not prime', () => {
      expect(isPrime(25)).toBe(false);
    });

    test('negative numbers are not prime', () => {
      expect(isPrime(-5)).toBe(false);
    });
  });
});

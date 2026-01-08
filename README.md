# Code Coverage Demo

A sample Node.js application demonstrating unit testing with Jest and code coverage reporting with [Coveralls](https://coveralls.io/).

[![Coverage Status](https://coveralls.io/repos/github/YOUR_USERNAME/code-coverage/badge.svg?branch=main)](https://coveralls.io/github/YOUR_USERNAME/code-coverage?branch=main)

## Features

This project includes:

- **Calculator Module** - Basic arithmetic operations plus factorial and prime checking
- **String Utilities** - Common string manipulation functions
- **Comprehensive Tests** - Full test coverage using Jest
- **GitHub Actions CI** - Automated testing on push/PR
- **Coveralls Integration** - Code coverage tracking and reporting

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
npm install
```

### Running Tests

Run tests:

```bash
npm test
```

Run tests with coverage report:

```bash
npm run test:coverage
```

## Project Structure

```
code-coverage/
├── src/
│   ├── calculator.js    # Calculator functions
│   ├── stringUtils.js   # String utility functions
│   └── index.js         # Main entry point
├── tests/
│   ├── calculator.test.js
│   └── stringUtils.test.js
├── .github/
│   └── workflows/
│       └── test.yml     # GitHub Actions workflow
├── jest.config.js       # Jest configuration
├── package.json
└── README.md
```

## API Reference

### Calculator

| Function | Description |
|----------|-------------|
| `add(a, b)` | Returns the sum of two numbers |
| `subtract(a, b)` | Returns the difference of two numbers |
| `multiply(a, b)` | Returns the product of two numbers |
| `divide(a, b)` | Returns the quotient (throws on division by zero) |
| `factorial(n)` | Returns n! (throws for negative numbers) |
| `isPrime(n)` | Returns true if n is a prime number |

### String Utilities

| Function | Description |
|----------|-------------|
| `reverse(str)` | Reverses a string |
| `isPalindrome(str)` | Checks if a string is a palindrome |
| `titleCase(str)` | Capitalizes first letter of each word |
| `truncate(str, maxLength)` | Truncates string with ellipsis |
| `countOccurrences(str, substring)` | Counts substring occurrences |

## Setting Up Coveralls

1. Go to [Coveralls.io](https://coveralls.io/) and sign in with GitHub
2. Add your repository to Coveralls
3. The GitHub Actions workflow will automatically upload coverage reports on push/PR

The workflow uses the [Coveralls GitHub Action](https://github.com/marketplace/actions/coveralls-github-action) to upload coverage data.

## License

MIT

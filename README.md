# Code Coverage Demo

A sample Node.js application demonstrating unit testing with Jest and **self-hosted code coverage** using GitHub Actions self-hosted runners and [Codecov Self-Hosted](https://github.com/codecov/self-hosted).

![Coverage](./coverage-badges/coverage.svg)

## Features

- **Calculator Module** - Basic arithmetic operations plus factorial and prime checking
- **String Utilities** - Common string manipulation functions
- **Array Utilities** - Array manipulation functions
- **Comprehensive Tests** - Full test coverage using Jest
- **Self-Hosted GitHub Actions** - Run CI on your own machine
- **Codecov Self-Hosted** - Full Codecov experience on your infrastructure
- **Local Coverage Server** - Lightweight alternative coverage dashboard

## Quick Start

```bash
# Install dependencies
npm install

# Run tests with coverage
npm run test:coverage

# Generate badges
npm run badges
```

---

## 🚀 Self-Hosted Setup Guide

This project supports two self-hosted coverage solutions:

### Option 1: Codecov Self-Hosted (Recommended)

Full Codecov experience with Docker, based on [codecov/self-hosted](https://github.com/codecov/self-hosted).

**Prerequisites:**
- Docker and Docker Compose
- Python 3 with pycryptodome

**Setup:**

```bash
# Run the setup script
npm run codecov:setup

# Or manually:
cd codecov-self-hosted
pip install pycryptodome
python3 scripts/generate-license.py --expires=2030-12-31 --company=MyCompany --users=100 --output=config/license
docker compose up -d
```

**Access Codecov:** http://localhost:8080

### Option 2: Lightweight Coverage Server

Simple Node.js server for basic coverage tracking (no Docker required).

```bash
# Start the coverage server
npm run coverage:server
```

**Access Dashboard:** http://localhost:3000

---

## Self-Hosted GitHub Runner Setup

### Step 1: Create a Self-Hosted Runner

1. Go to your GitHub repository settings
2. Navigate to **Settings → Actions → Runners → New self-hosted runner**
3. Select your operating system
4. Follow the instructions to download and configure the runner

```bash
# Example for macOS
mkdir ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-osx-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-osx-x64-2.311.0.tar.gz
tar xzf ./actions-runner-osx-x64-2.311.0.tar.gz

# Configure with your repository
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# Run as a service
sudo ./svc.sh install
sudo ./svc.sh start
```

### Step 2: Configure Repository Secrets

Add these secrets to your repository (**Settings → Secrets and variables → Actions**):

| Secret | Description |
|--------|-------------|
| `CODECOV_TOKEN` | Upload token from your Codecov self-hosted instance |

---

## Codecov Self-Hosted Details

### Architecture

The Codecov self-hosted setup includes:

| Service | Port | Description |
|---------|------|-------------|
| **Codecov UI** | 8080 | Main web interface |
| **API** | 8080 | REST API |
| **MinIO** | 9000/9001 | S3-compatible storage |
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Cache and task queue |

### Configuration

#### GitHub OAuth App

To enable GitHub login:

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Codecov Self-Hosted
   - **Homepage URL:** http://localhost:8080
   - **Callback URL:** http://localhost:8080/login/github
4. Copy Client ID and Secret to `codecov-self-hosted/config/codecov.yml`

#### License

Codecov self-hosted requires a license (free for self-hosted use):

```bash
cd codecov-self-hosted/scripts
pip install pycryptodome
python3 generate-license.py --expires=2030-12-31 --company=MyCompany --users=100 --output=../config/license
```

### Commands

```bash
# Start Codecov
npm run codecov:start

# Stop Codecov
npm run codecov:stop

# View logs
npm run codecov:logs

# Full setup wizard
npm run codecov:setup
```

---

## Project Structure

```
code-coverage/
├── src/                          # Source code
│   ├── calculator.js
│   ├── stringUtils.js
│   ├── arrayUtils.js
│   └── index.js
├── tests/                        # Test files
│   ├── calculator.test.js
│   ├── stringUtils.test.js
│   └── arrayUtils.test.js
├── scripts/                      # Local coverage scripts
│   ├── coverage-server.js        # Lightweight coverage server
│   ├── generate-badge.js         # Badge generator
│   └── setup-runner.sh           # Runner setup helper
├── codecov-self-hosted/          # Codecov self-hosted config
│   ├── docker-compose.yml        # Docker services
│   ├── config/
│   │   ├── codecov.yml           # Codecov configuration
│   │   └── license               # License file
│   └── scripts/
│       ├── setup.sh              # Setup wizard
│       └── generate-license.py   # License generator
├── .github/workflows/
│   └── self-hosted-coverage.yml  # GitHub Actions workflow
├── coverage/                     # Generated coverage reports
├── coverage-badges/              # Generated badges
├── jest.config.js
├── package.json
└── README.md
```

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run badges` | Generate SVG badges |
| `npm run coverage:server` | Start lightweight coverage server |
| `npm run coverage:full` | Run tests + generate badges |
| `npm run codecov:setup` | Setup Codecov self-hosted |
| `npm run codecov:start` | Start Codecov containers |
| `npm run codecov:stop` | Stop Codecov containers |
| `npm run codecov:logs` | View Codecov logs |

---

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

---

## Troubleshooting

### Codecov containers not starting

```bash
# Check container status
docker compose ps

# View logs
docker compose logs api
docker compose logs worker

# Restart all services
docker compose restart
```

### Runner not picking up jobs

1. Verify runner is online: `./run.sh` or check service status
2. Ensure workflow uses `runs-on: self-hosted`
3. Check runner logs in `~/actions-runner/_diag/`

### Coverage upload failing

1. Verify `CODECOV_TOKEN` secret is set
2. Check Codecov is running: http://localhost:8080
3. Verify network connectivity between runner and Codecov

---

## Resources

- [Codecov Self-Hosted Repository](https://github.com/codecov/self-hosted)
- [GitHub Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Codecov Documentation](https://docs.codecov.com/)
- [Jest Coverage](https://jestjs.io/docs/configuration#collectcoverage-boolean)

---

## License

MIT

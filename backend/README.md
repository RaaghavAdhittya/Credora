# Backend Service

Node.js and Express REST API service for off-chain credential processing, hash generation, database storage (MySQL), and relaying transactions to the Ethereum Sepolia smart contract.

## Directory Structure

- `src/config/`: Configuration modules for MySQL connection and Web3 providers.
- `src/controllers/`: Request handlers for credential submission and verification inquiries.
- `src/routes/`: Express route definitions.
- `src/services/`: Core logic for cryptographic hashing, credential verification, and blockchain interaction.
- `src/middlewares/`: Authentication, rate limiting, and input validation middleware.
- `src/utils/`: Cryptographic primitives, hashing helpers, and formatting utilities.

## Scripts

- `npm start`: Runs the server in production mode.
- `npm run dev`: Runs the server with auto-reload using `nodemon`.

## Configuration

Copy `.env.example` to `.env` and set MySQL credentials and Sepolia RPC endpoints.

# Blockchain Smart Contracts

Hardhat workspace for developing, testing, and deploying the privacy-preserving credential registry smart contracts to the **Ethereum Sepolia** testnet.

## Directory Structure

- `contracts/`: Solidity smart contracts (credential registry, verification proofs, revocation registry).
- `scripts/`: Deployment, migration, and contract verification scripts.
- `test/`: Automated test suite simulating contract interactions and cryptographic validation.
- `hardhat.config.js`: Hardhat runtime environment configuration for local and Sepolia networks.

## Setup & Commands

1. Copy `.env.example` to `.env` and provide your `SEPOLIA_RPC_URL` and `PRIVATE_KEY`.
2. Compile contracts:
   ```bash
   npx hardhat compile
   ```
3. Run test suite:
   ```bash
   npx hardhat test
   ```
4. Deploy to Ethereum Sepolia:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

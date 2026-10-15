# Privacy-Preserving Blockchain-Based Verification System for APAAR-Linked Academic Credentials

A decentralized and privacy-preserving credential verification framework integrating India's **Automated Permanent Academic Account Registry (APAAR / One Nation, One Student ID)** ecosystem with the **Ethereum Sepolia** testnet.

---

## 🌟 Overview

The **APAAR** initiative assigns a unique, lifelong digital identifier to students across India. While centralized registries facilitate credential issuance, third-party verification often entails over-exposure of Personally Identifiable Information (PII) and introduces single points of failure.

This project delivers a **privacy-preserving blockchain verification architecture** that:
- Anchors cryptographic proofs (hashes/commitments) of academic credentials onto an immutable public blockchain ledger (Ethereum Sepolia).
- Enables employers, institutions, and verifying parties to validate authenticity without exposing underlying sensitive student data (grades, Aadhaar/APAAR numbers, demographic details).
- Eliminates counterfeit diplomas and degrees while strictly complying with data minimization and student privacy mandates.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Ethers.js |
| **Backend** | Node.js, Express.js, Ethers.js |
| **Database** | MySQL (Relational persistence for off-chain metadata) |
| **Blockchain** | Solidity, Hardhat, Ethers.js |
| **Network** | Ethereum Sepolia Testnet |

---

## 📁 Repository Structure

```text
apaar-blockchain-verifier/
├── frontend/             # React + Vite + Tailwind CSS web interface
│   ├── src/              # UI components, pages, Web3 provider integration
│   ├── public/           # Static public assets
│   ├── package.json      # Frontend dependencies & build scripts
│   ├── vite.config.js    # Vite configuration
│   └── .env.example      # Frontend environment variable templates
│
├── backend/              # Node.js + Express REST API server
│   ├── src/              # Controllers, routes, services, middleware
│   ├── package.json      # Backend dependencies & server scripts
│   └── .env.example      # Server & database environment templates
│
├── blockchain/           # Hardhat environment for smart contracts
│   ├── contracts/        # Solidity smart contracts
│   ├── scripts/          # Deployment and verification scripts
│   ├── test/             # Contract unit and integration test suites
│   ├── hardhat.config.js # Hardhat configuration for Sepolia
│   └── .env.example      # RPC URL and private key templates
│
├── database/             # Relational data layer (MySQL)
│   ├── migrations/       # Database schema migrations
│   ├── seeds/            # Initial/sample seed data
│   └── README.md         # Database setup guidelines
│
├── docs/                 # Architectural specifications and developer guides
│   ├── architecture.md   # System architecture & verification flow
│   ├── api-spec.md       # API specification & payload conventions
│   ├── blockchain-spec.md# Smart contract & verification specs
│   └── setup-guide.md    # Developer onboarding & environment setup
│
├── .gitignore            # Git ignore rules for Node, builds, IDEs, and secrets
└── README.md             # Project documentation (this file)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (verified with `v24.x`)
- **npm**: `v10.x` or higher
- **MySQL**: `v8.0` or higher
- **Metamask** or compatible Web3 wallet configured with Ethereum Sepolia testnet funds

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd apaar-blockchain-verifier
   ```

2. **Blockchain Setup (Hardhat):**
   ```bash
   cd blockchain
   npm install
   cp .env.example .env
   # Populate SEPOLIA_RPC_URL and PRIVATE_KEY in .env
   npx hardhat compile
   ```

3. **Backend Setup (Express + MySQL):**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   # Configure database credentials and Sepolia RPC in .env
   npm run dev
   ```

4. **Frontend Setup (React + Vite + Tailwind CSS):**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

---

## 🔒 Privacy & Security Principles

1. **Zero Raw PII On-Chain**: Raw APAAR IDs, names, and academic records are never published to the public blockchain.
2. **Cryptographic Proofs**: Cryptographic hashes / Merkle roots / commitments are anchored on-chain to provide tamper-evident proofs.
3. **Data Minimization**: Verifiers only receive verification status (Valid / Invalid / Revoked) without accessing full student dossiers.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

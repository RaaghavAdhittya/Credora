# Credora — Privacy-Preserving Lifelong Academic Credential Network

A decentralized, privacy-preserving credential verification and lifelong academic record system connecting India's **Automated Permanent Academic Account Registry (APAAR / One Nation, One Student ID)** identity model to cryptographic anchors on the **Ethereum Sepolia** blockchain.

---

## 📌 Problem & Purpose

Academic credential fraud, slow manual background verifications, and unauthorized exposure of student Personally Identifiable Information (PII) remain significant vulnerabilities in education systems worldwide. While centralized educational databases simplify record issuance, third-party audits often demand invasive sharing of sensitive data such as raw Aadhaar or APAAR numbers, personal contact info, and detailed marksheets.

**Credora** bridges decentralized trust and institutional identity through a **zero-knowledge, privacy-preserving architecture**:
- **Lifelong Student Timeline**: Students curate a comprehensive academic passport containing secondary board results, diplomas, undergraduate degrees, postgraduate degrees, transcripts, and doctoral milestones across multiple institutions.
- **Off-Chain Privacy / On-Chain Verifiability**: Sensitive academic documents and raw student records remain securely off-chain in MySQL; only canonical **Keccak-256 cryptographic proofs** and validity/revocation states are anchored to Ethereum Sepolia.
- **Privacy-Preserving Identity**: Students' raw 12-digit APAAR IDs are salted and hashed on the server; neither raw APAAR identifiers nor protected identity references are ever published to the public blockchain or embedded in shareable QR codes.
- **Instant Dual-Consensus Audit**: Verifiers independently audit credential validity in milliseconds across both off-chain metadata and the Sepolia smart contract registry.

---

## 🏛️ System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │            Student Academic Passport                   │
                  │  (Lifelong Timeline, Board Exams, Degrees, QR Sharing) │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
  ┌───────────────────────┐       ┌──────────────────────┐       ┌───────────────────────┐
  │  Accredited Issuer    │       │     Credora Core     │       │  Independent Verifier │
  │  (Issue & Revoke)     ├──────►│  Backend REST API    │◄──────┤  (Manual ID & Scan QR)│
  └───────────────────────┘       └──────────┬───────────┘       └───────────────────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        ▼                                         ▼
            ┌──────────────────────┐                  ┌──────────────────────┐
            │   MySQL Off-Chain    │                  │   Ethereum Sepolia   │
            │      Metadata        │                  │   Smart Contract     │
            │ (Canonical Payloads, │                  │ (Keccak-256 Proofs,  │
            │ Salted APAAR Refs)   │                  │  Revocation State)   │
            └──────────────────────┘                  └──────────────────────┘
```

---

## 🚀 Core Features & Workflows

### 1. Student Academic Passport (`/student`)
- **Lifelong Academic Timeline**: Interactive chronological view of all verified credentials (Class 10/12 Board Exams, Diplomas, UG/PG Degrees, Transcripts, PhD Milestones).
- **APAAR-Linked Identity**: Lookup records via 12-digit APAAR identifier while keeping the raw APAAR ID and internal identity salt strictly protected.
- **Overview Metrics**: Total verified achievements, institutions attended, and current/latest qualification.
- **Category Filtering**: Filter achievements by Board Results, Degrees, Diplomas, Transcripts, and Certifications.
- **Cryptographic Details**: Expandable audit drawer displaying canonical payload hash, issuer ID, and Sepolia transaction links.
- **Show QR & Share**: Generate a privacy-preserving verification QR code or shareable audit URL.

### 2. Accredited Institution Portal (`/institution`)
- **Credential Issuance**: Accredited institutions issue academic credentials across 8 standard milestone types.
- **Deterministic Canonical Hashing**: Creates deterministic Keccak-256 payload hashes before anchoring to the Ethereum smart contract.
- **Credential Revocation**: Authorized issuers can revoke credentials on-chain, immediately invalidating compromised or erroneous awards.

### 3. Independent Verifier Portal (`/verifier`)
- **Cryptographic Proof Audit**: Recomputes the Keccak-256 hash of off-chain metadata and cross-references on-chain state on Ethereum Sepolia.
- **State Confirmation**: Confirms whether a record is `ISSUED`, `REVOKED`, or `TAMPERED`.
- **Pre-loaded Demo Samples**: Quick-test buttons for both valid issued credentials and revoked records.

### 4. QR Code Verification Flow (Phase 2C)
- **Zero-PII QR Generation**: QR codes encode strictly the public Credential ID / canonical verification URL (`/?verify=CRED-...`). No raw APAAR ID, no protected reference, and no PII are ever embedded.
- **In-Browser Camera Scanner**: Live webcam scanner with environment/back-camera prioritization using `html5-qrcode`.
- **Image File Upload**: Support for uploading QR images or screenshots on devices without cameras.
- **Instant Auto-Audit**: Scanning a QR code automatically populates the Verifier portal and triggers the on-chain consensus audit.
- **Manual Fallback**: Seamless one-click switch to manual credential ID entry if camera permissions are unavailable.

### 5. Blockchain Ledger Explorer (`/blockchain`)
- **Public Audit Log**: Live read-only stream of on-chain issuance and revocation events recorded on Ethereum Sepolia.
- **Direct Etherscan Links**: Inspect block numbers, transaction hashes, smart contract addresses, and execution receipts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, `html5-qrcode`, `qrcode` |
| **Backend** | Node.js, Express.js, Ethers.js v6, MySQL2 |
| **Smart Contracts** | Solidity (`AcademicCredentialRegistry.sol`), Hardhat, OpenZeppelin |
| **Blockchain Network** | Ethereum Sepolia Testnet (Chain ID: `11155111`) |
| **Database** | MySQL 8.0 (Relational off-chain persistence) |
| **Cryptography** | Keccak-256 (SHA-3 family), HMAC-SHA256 salted references |

---

## 🔒 Privacy Model & Data Protection

1. **Zero Raw Identity Data On-Chain**:
   - Neither 12-digit APAAR IDs, Aadhaar numbers, student names, nor grades are ever sent to or stored on the Ethereum blockchain.
   - The smart contract records only `bytes32 credentialIdHash`, `bytes32 credentialHash`, and `institutionId`.
2. **Server-Side Identity Salt Isolation**:
   - APAAR identity references are derived via HMAC-SHA256 using a server-side environment secret (`APAAR_ID_SECRET`).
   - The secret is strictly isolated on the backend and is never exposed to the frontend, database clients, or blockchain transactions.
3. **Off-Chain Document Storage**:
   - Sensitive academic documents and raw student records remain securely off-chain in MySQL.
   - The blockchain ledger holds only immutable cryptographic proofs (Keccak-256) and validity/revocation flags.
4. **Data Minimization in QR Codes**:
   - Generated QR codes encode only the public verification link or canonical credential ID.
   - Scanning parties verify legitimacy without accessing the student's broader personal record dossier.

---

## ⚠️ Important Disclaimers & Clarifications

> [!IMPORTANT]
> 1. **Ethereum Sepolia Testnet**: This project runs on the public Ethereum Sepolia testnet for academic and demonstration purposes.
> 2. **No Real Aadhaar Integration**: Real Aadhaar authentication or biometric integration is **NOT** implemented in this system.
> 3. **No Claim of Official Government API Integration**: Credora is an architectural proof-of-concept demonstrating privacy-preserving blockchain verification for APAAR identifiers; it is **NOT** officially affiliated with or connected to government APAAR/DigiLocker production APIs.
> 4. **No Raw Identity On-Chain**: Raw identity data is mathematically prohibited from being stored on the blockchain.
> 5. **Off-Chain Academic Documents**: Transcripts and diplomas are kept off-chain; the blockchain acts exclusively as a trust anchor verifying state and cryptographic integrity.

---

## 🚀 Setup & Running Instructions

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MySQL**: `v8.0` or higher
- **Sepolia Testnet RPC**: (e.g. Alchemy, Infura, or public RPC)

---

### 1. Database Setup (MySQL)
Create the database and run migrations:
```bash
# In MySQL CLI:
CREATE DATABASE credora_db;
```
Run the migrations in [`database/migrations/`](file:///d:/SEM%203/BLOCKCHAIN/apaar-blockchain-verifier/database/migrations/):
```bash
mysql -u root -p credora_db < database/migrations/001_create_credentials_table.sql
mysql -u root -p credora_db < database/migrations/002_add_revocation_support.sql
mysql -u root -p credora_db < database/migrations/003_add_phase1_academic_records.sql
```

---

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials, SEPOLIA_RPC_URL, PRIVATE_KEY, and APAAR_ID_SECRET
```

Run backend tests:
```bash
npm test
# 21/21 tests pass
```

Start the backend API server:
```bash
npm run dev
# Server running on http://localhost:5000
```

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Validate production build:
```bash
npm run build
```

Start the Vite development server:
```bash
npm run dev
# Frontend accessible at http://localhost:5173
```

---

### 4. Smart Contract Registry
- **Network**: Ethereum Sepolia (`11155111`)
- **Contract Address**: [`0x54ca31cb1AA8d1E018297B1a960ed3FA74eC419e`](https://sepolia.etherscan.io/address/0x54ca31cb1AA8d1E018297B1a960ed3FA74eC419e)
- **Hardhat Compilation** (optional):
  ```bash
  cd ../blockchain
  npm install
  npx hardhat compile
  ```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

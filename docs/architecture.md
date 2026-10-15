# System Architecture & Privacy Design

## 1. Introduction

The **APAAR Blockchain Verifier** is designed to provide cryptographic verification for academic credentials linked to APAAR IDs without compromising student privacy or storing Personally Identifiable Information (PII) on a public blockchain ledger.

---

## 2. Privacy-Preserving Verification Model

```text
[Educational Institution]
         │
         ▼  (1) Hash / Salt Generation
[Credential Payload] ───► [SHA-256 / Keccak-256 Hash + Salt]
         │                                │
         ▼ (2) Off-Chain Storage           ▼ (3) On-Chain Anchoring
  [MySQL Database]                [Ethereum Sepolia Contract]
  (Encrypted Credential Metadata)   (Anchor Hash, Issuer, Status)
                                          ▲
                                          │ (4) Zero-PII Verification
                                  [Third-Party Verifier]
```

### Core Privacy Guarantees

1. **Zero Raw PII On-Chain**:
   - The student's name, APAAR identifier, Aadhaar details, grades, and birthdate are strictly omitted from on-chain storage.
2. **Cryptographic Commitment / Digest**:
   - Only a cryptographic digest (e.g. `keccak256(APAAR_ID + Salt + Degree_Data)`) or Merkle root is anchored onto Ethereum Sepolia.
3. **Selective Disclosure & Consent**:
   - The student or institution provides the credential holder with the verification proof/salt.
   - Verifiers recompute the digest locally and query the smart contract for validity (`isVerified == true` and `isRevoked == false`).

---

## 3. High-Level Components

- **Frontend (React + Vite + Tailwind CSS)**:
  - User portal for students, institutions, and verifiers.
  - Web3 wallet interaction (MetaMask) via Ethers.js.
  - Document upload and client-side proof computation.

- **Backend (Node.js + Express)**:
  - REST API handling off-chain institutional authentication and credential management.
  - Relays verified transactions to the Ethereum Sepolia network.
  - Communicates with MySQL for relational persistence.

- **Database (MySQL)**:
  - Stores institutional records, encrypted metadata references, and audit logs.

- **Blockchain (Solidity + Hardhat + Sepolia)**:
  - Immutable registry smart contract managing credential status, issuer permissions, and revocation logs.

# API Specification Overview

This document outlines the planned API conventions and endpoint structure for the Express backend.

---

## Base URL

```text
http://localhost:5000/api
```

---

## Endpoint Roadmap

### 1. Health & Status
- `GET /health`: Returns service health status and timestamp.

### 2. Authentication & Institution Onboarding
- `POST /auth/login`: Institution login and session generation.
- `GET /auth/me`: Current authenticated entity details.

### 3. Credential Management (Off-chain)
- `POST /credentials/issue`: Register off-chain metadata, compute hash commitment, and prepare transaction.
- `GET /credentials/:id`: Retrieve metadata for authorized holders.

### 4. Verification
- `POST /verify/hash`: Verifies a provided proof/hash against the Ethereum Sepolia smart contract.
- `GET /verify/status/:hash`: Query on-chain status (active, invalid, revoked).

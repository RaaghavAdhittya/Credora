# Developer Setup Guide

Comprehensive instructions for setting up the local development environment for the **APAAR Blockchain Verifier**.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MySQL**: `v8.0` or higher
- **Git**

---

## 2. Directory Navigation & Installation

### Blockchain (Hardhat)
```bash
cd blockchain
npm install
cp .env.example .env
# Edit .env with your Sepolia RPC and private key
```

### Backend (Express)
```bash
cd ../backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and Sepolia RPC
```

### Frontend (React + Vite + Tailwind CSS)
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with API and contract configurations
```

---

## 3. Running Services Locally

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   Server defaults to `http://localhost:5000` (health check: `http://localhost:5000/api/health`).

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Client defaults to `http://localhost:5173`.

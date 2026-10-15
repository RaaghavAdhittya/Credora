# Frontend Client

React application initialized with **Vite** and styled using **Tailwind CSS**, designed for interfacing with the APAAR Credential Verification System and Web3 providers (Ethers.js / Ethereum Sepolia).

## Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Bundles the application for production.
- `npm run preview`: Previews the production build locally.

## Configuration

Copy `.env.example` to `.env` and configure:
- `VITE_BACKEND_API_URL`: URL of the Express backend.
- `VITE_SEPOLIA_RPC_URL`: Ethereum Sepolia RPC endpoint.
- `VITE_CONTRACT_ADDRESS`: Deployed verification contract address.

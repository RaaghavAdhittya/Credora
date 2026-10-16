import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env first
dotenv.config();

// If Sepolia environment variables are not in backend .env, load from blockchain/.env
if (!process.env.SEPOLIA_RPC_URL || !process.env.SEPOLIA_PRIVATE_KEY) {
  const blockchainEnvPath = path.resolve(__dirname, '../../../blockchain/.env');
  if (fs.existsSync(blockchainEnvPath)) {
    dotenv.config({ path: blockchainEnvPath });
  }
}

const rpcUrl = process.env.SEPOLIA_RPC_URL || '';
const rawKey = (
  process.env.SEPOLIA_PRIVATE_KEY ||
  process.env.RELAYER_PRIVATE_KEY ||
  process.env.PRIVATE_KEY ||
  ''
).trim();

const formattedKey = rawKey.startsWith('0x') ? rawKey : (rawKey ? `0x${rawKey}` : '');

/**
 * Sanitizes strings to prevent accidental leakage of private keys or RPC endpoints.
 */
export function sanitizeError(error) {
  let msg = (error && error.message) || String(error);
  if (rpcUrl) {
    msg = msg.split(rpcUrl).join('[REDACTED_RPC_URL]');
  }
  if (rawKey) {
    msg = msg.split(rawKey).join('[REDACTED_PRIVATE_KEY]');
  }
  if (formattedKey) {
    msg = msg.split(formattedKey).join('[REDACTED_PRIVATE_KEY]');
  }
  return msg;
}

// Load deployment JSON and Contract ABI
const deploymentPath = path.resolve(__dirname, '../../../blockchain/deployment/sepolia.json');
const artifactPath = path.resolve(
  __dirname,
  '../../../blockchain/artifacts/contracts/APAARCredentialRegistry.sol/APAARCredentialRegistry.json'
);

let deployment = null;
let contractAbi = null;

if (fs.existsSync(deploymentPath)) {
  deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
}

if (fs.existsSync(artifactPath)) {
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  contractAbi = artifact.abi;
}

const contractAddress = deployment ? deployment.contractAddress : '';

// Provider & Wallet setup
let provider = null;
let wallet = null;
let contract = null;
let readOnlyContract = null;

if (rpcUrl) {
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    if (/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
      wallet = new ethers.Wallet(formattedKey, provider);
    }
    if (contractAddress && contractAbi) {
      readOnlyContract = new ethers.Contract(contractAddress, contractAbi, provider);
      if (wallet) {
        contract = new ethers.Contract(contractAddress, contractAbi, wallet);
      }
    }
  } catch (err) {
    console.error('[Blockchain] Initialization warning:', sanitizeError(err.message));
  }
}

export function getContractAddress() {
  return contractAddress;
}

export function getDeployerAddress() {
  return wallet ? wallet.address : (deployment ? deployment.deployerAddress : null);
}

/**
 * Submits credential registration transaction to the Sepolia smart contract.
 *
 * @param {string} credentialIdHash - bytes32 identifier hash
 * @param {string} credentialHash - bytes32 canonical document hash
 * @param {string} institutionId - Institution identifier string
 * @returns {Promise<{ transactionHash: string, blockNumber: number }>}
 */
export async function registerCredentialOnChain(credentialIdHash, credentialHash, institutionId) {
  if (!contract) {
    throw new Error('Blockchain contract is not initialized with a signer. Check SEPOLIA configuration.');
  }

  try {
    const tx = await contract.registerCredential(credentialIdHash, credentialHash, institutionId);
    const receipt = await tx.wait(1);
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    throw new Error(sanitizeError(error.message));
  }
}

/**
 * Submits credential revocation transaction to the Sepolia smart contract.
 *
 * @param {string} credentialIdHash - bytes32 identifier hash
 * @returns {Promise<{ transactionHash: string, blockNumber: number }>}
 */
export async function revokeCredentialOnChain(credentialIdHash) {
  if (!contract) {
    throw new Error('Blockchain contract is not initialized with a signer. Check SEPOLIA configuration.');
  }

  try {
    const tx = await contract.revokeCredential(credentialIdHash);
    const receipt = await tx.wait(1);
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    throw new Error(sanitizeError(error.message));
  }
}

/**
 * Queries the smart contract on Sepolia to verify credential validity and hash match.
 *
 * @param {string} credentialIdHash - bytes32 identifier hash
 * @returns {Promise<{ valid: boolean, credentialHash: string, institutionId: string, issuedAt: number }>}
 */
export async function verifyCredentialOnChain(credentialIdHash) {
  const targetContract = readOnlyContract || contract;
  if (!targetContract) {
    throw new Error('Blockchain contract reader is not initialized. Check SEPOLIA configuration.');
  }

  try {
    const [valid, onChainHash, onChainInstId, issuedAt] = await targetContract.verifyCredential(credentialIdHash);
    return {
      valid,
      credentialHash: onChainHash,
      institutionId: onChainInstId,
      issuedAt: Number(issuedAt),
    };
  } catch (error) {
    throw new Error(sanitizeError(error.message));
  }
}

export { provider, wallet, contract, readOnlyContract };

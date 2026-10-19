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

// Embedded ABI fallback so production does not depend on local Hardhat build artifacts
const EMBEDDED_ABI = [
  'function registerCredential(bytes32 credentialIdHash, bytes32 credentialHash, string calldata institutionId) external',
  'function revokeCredential(bytes32 credentialIdHash) external',
  'function verifyCredential(bytes32 credentialIdHash) external view returns (bool valid, bytes32 credentialHash, string memory institutionId, uint256 issuedAt)',
  'event CredentialRegistered(bytes32 indexed credentialIdHash, bytes32 indexed credentialHash, string institutionId, uint256 issuedAt)',
  'event CredentialRevoked(bytes32 indexed credentialIdHash, uint256 revokedAt)',
  'error CredentialAlreadyExists(bytes32 credentialIdHash)',
  'error CredentialNotFound(bytes32 credentialIdHash)',
  'error CredentialAlreadyRevoked(bytes32 credentialIdHash)',
  'error InvalidCredentialIdHash()',
  'error InvalidCredentialHash()',
  'error EmptyInstitutionId()'
];

// Load deployment JSON and Contract ABI (with embedded fallback)
const deploymentPath = path.resolve(__dirname, '../../../blockchain/deployment/sepolia.json');
const artifactPath = path.resolve(
  __dirname,
  '../../../blockchain/artifacts/contracts/APAARCredentialRegistry.sol/APAARCredentialRegistry.json'
);

let deployment = null;
let contractAbi = EMBEDDED_ABI;

if (fs.existsSync(deploymentPath)) {
  try {
    deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  } catch (err) {
    console.warn('[Blockchain] Could not parse deployment file:', sanitizeError(err.message));
  }
}

if (fs.existsSync(artifactPath)) {
  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    if (artifact && artifact.abi) {
      contractAbi = artifact.abi;
    }
  } catch (err) {
    console.warn('[Blockchain] Could not parse artifact file, using embedded ABI:', sanitizeError(err.message));
  }
}

const contractAddress = (
  process.env.CONTRACT_ADDRESS ||
  (deployment ? deployment.contractAddress : '') ||
  ''
).trim();

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

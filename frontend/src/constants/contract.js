export const CONTRACT_ADDRESS = '0x54ca31cb1AA8d1E018297B1a960ed3FA74eC419e';
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';

// Live on-chain demo credential for quick-testing
export const DEMO_CREDENTIAL_ID = 'CRED-MVB9R883-53EAF478';

export function getEtherscanAddressUrl(address) {
  return `${SEPOLIA_EXPLORER_URL}/address/${address}`;
}

export function getEtherscanTxUrl(txHash) {
  return `${SEPOLIA_EXPLORER_URL}/tx/${txHash}`;
}

export function getEtherscanBlockUrl(blockNumber) {
  return `${SEPOLIA_EXPLORER_URL}/block/${blockNumber}`;
}


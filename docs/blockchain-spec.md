# Blockchain & Smart Contract Specification

## Target Network

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: `11155111`
- **Currency**: SepoliaETH
- **Solidity Version**: `^0.8.24`

---

## Smart Contract Architecture Design

### Primary Registry Contract (`CredentialRegistry.sol`)

The future smart contract will manage the life-cycle of privacy-preserving credential commitments:

1. **State Records**:
   - `bytes32 credentialHash`: Hash commitment representing the credential payload.
   - `address issuer`: Ethereum address of the issuing institution.
   - `uint256 issueTimestamp`: Block timestamp at anchoring.
   - `bool isRevoked`: Revocation flag.

2. **Core Capabilities**:
   - `anchorCredential(bytes32 credentialHash)`: Called by authorized issuer addresses to register a new credential commitment.
   - `revokeCredential(bytes32 credentialHash, string reason)`: Allows issuer to invalidate compromised credentials.
   - `verifyCredential(bytes32 credentialHash)`: Public view function returning validity and issuance details.

3. **Events**:
   - `CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 timestamp)`
   - `CredentialRevoked(bytes32 indexed credentialHash, address indexed issuer, string reason)`

// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title APAARCredentialRegistry
 * @notice Minimal decentralized registry for verifying academic credentials associated with APAAR IDs.
 * @dev Stores only cryptographic digests and verification status. No PII, student names, Aadhaar numbers,
 *      or raw academic records are stored on-chain.
 */
contract APAARCredentialRegistry is AccessControl {
    /// @notice Role identifier for accredited institutions authorized to register and revoke credentials.
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    /// @notice Struct containing verification metadata for an issued credential.
    struct Credential {
        bytes32 credentialHash;
        string institutionId;
        uint256 issuedAt;
        bool valid;
    }

    /// @dev Internal mapping from credentialIdHash to Credential record.
    mapping(bytes32 => Credential) private _credentials;

    /// @notice Emitted when a new credential is successfully registered.
    event CredentialRegistered(
        bytes32 indexed credentialIdHash,
        bytes32 indexed credentialHash,
        string institutionId,
        uint256 issuedAt
    );

    /// @notice Emitted when an existing credential is validly revoked.
    event CredentialRevoked(
        bytes32 indexed credentialIdHash,
        uint256 revokedAt
    );

    /// @notice Reverted when registering an already-registered credential identifier.
    error CredentialAlreadyExists(bytes32 credentialIdHash);

    /// @notice Reverted when performing an operation on a non-existent credential.
    error CredentialNotFound(bytes32 credentialIdHash);

    /// @notice Reverted when revoking an already-revoked credential.
    error CredentialAlreadyRevoked(bytes32 credentialIdHash);

    /// @notice Reverted when provided credential identifier hash is zero.
    error InvalidCredentialIdHash();

    /// @notice Reverted when provided credential hash digest is zero.
    error InvalidCredentialHash();

    /// @notice Reverted when provided institution identifier string is empty.
    error EmptyInstitutionId();

    /**
     * @notice Initializes registry contract and assigns DEFAULT_ADMIN_ROLE to deployer.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Registers a new credential hash on-chain.
     * @dev Restricted to callers holding INSTITUTION_ROLE. Rejects duplicate credentialIdHash.
     * @param credentialIdHash SHA-256 or Keccak-256 hash identifying the credential without revealing PII.
     * @param credentialHash Cryptographic digest of the underlying canonical credential document.
     * @param institutionId Public accredited institution identifier (e.g. AISHE code).
     */
    function registerCredential(
        bytes32 credentialIdHash,
        bytes32 credentialHash,
        string calldata institutionId
    ) external onlyRole(INSTITUTION_ROLE) {
        if (credentialIdHash == bytes32(0)) {
            revert InvalidCredentialIdHash();
        }
        if (credentialHash == bytes32(0)) {
            revert InvalidCredentialHash();
        }
        if (bytes(institutionId).length == 0) {
            revert EmptyInstitutionId();
        }
        if (_credentials[credentialIdHash].issuedAt != 0) {
            revert CredentialAlreadyExists(credentialIdHash);
        }

        _credentials[credentialIdHash] = Credential({
            credentialHash: credentialHash,
            institutionId: institutionId,
            issuedAt: block.timestamp,
            valid: true
        });

        emit CredentialRegistered(
            credentialIdHash,
            credentialHash,
            institutionId,
            block.timestamp
        );
    }

    /**
     * @notice Retrieves credential verification details for a given identifier hash.
     * @param credentialIdHash Cryptographic hash identifying the credential.
     * @return valid True if credential is valid and not revoked, false otherwise.
     * @return credentialHash Document digest stored during registration.
     * @return institutionId Identifier of the issuing institution.
     * @return issuedAt Unix timestamp of when the credential was registered on-chain.
     */
    function verifyCredential(
        bytes32 credentialIdHash
    )
        external
        view
        returns (
            bool valid,
            bytes32 credentialHash,
            string memory institutionId,
            uint256 issuedAt
        )
    {
        Credential storage credential = _credentials[credentialIdHash];
        return (
            credential.valid,
            credential.credentialHash,
            credential.institutionId,
            credential.issuedAt
        );
    }

    /**
     * @notice Revokes an existing valid credential.
     * @dev Restricted to callers holding INSTITUTION_ROLE. Rejects nonexistent and already-revoked credentials.
     * @param credentialIdHash Cryptographic hash identifying the credential to revoke.
     */
    function revokeCredential(
        bytes32 credentialIdHash
    ) external onlyRole(INSTITUTION_ROLE) {
        Credential storage credential = _credentials[credentialIdHash];
        if (credential.issuedAt == 0) {
            revert CredentialNotFound(credentialIdHash);
        }
        if (!credential.valid) {
            revert CredentialAlreadyRevoked(credentialIdHash);
        }

        credential.valid = false;

        emit CredentialRevoked(credentialIdHash, block.timestamp);
    }
}

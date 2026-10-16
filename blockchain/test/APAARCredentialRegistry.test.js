const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("APAARCredentialRegistry", function () {
  let registry;
  let admin;
  let institution;
  let otherAccount;
  let institutionRole;
  let defaultAdminRole;

  // Synthetic test hashes and IDs (no personal data or PII)
  const credentialIdHash = ethers.keccak256(ethers.toUtf8Bytes("MOCK_APAAR_RECORD_ID_001"));
  const credentialHash = ethers.keccak256(ethers.toUtf8Bytes("MOCK_CREDENTIAL_PAYLOAD_HASH_001"));
  const institutionId = "INST_AISHE_U-0123";

  beforeEach(async function () {
    [admin, institution, otherAccount] = await ethers.getSigners();
    const RegistryFactory = await ethers.getContractFactory("APAARCredentialRegistry");
    registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();

    institutionRole = await registry.INSTITUTION_ROLE();
    defaultAdminRole = await registry.DEFAULT_ADMIN_ROLE();
  });

  describe("Deployment and Admin Role", function () {
    it("should assign DEFAULT_ADMIN_ROLE to deployer", async function () {
      expect(await registry.hasRole(defaultAdminRole, admin.address)).to.be.true;
      expect(await registry.hasRole(defaultAdminRole, otherAccount.address)).to.be.false;
    });

    it("should define INSTITUTION_ROLE constant correctly", async function () {
      expect(institutionRole).to.equal(ethers.keccak256(ethers.toUtf8Bytes("INSTITUTION_ROLE")));
    });

    it("should configure DEFAULT_ADMIN_ROLE as the admin role for INSTITUTION_ROLE", async function () {
      expect(await registry.getRoleAdmin(institutionRole)).to.equal(defaultAdminRole);
    });
  });

  describe("Institution Role Management", function () {
    it("should allow admin to grant and revoke INSTITUTION_ROLE", async function () {
      expect(await registry.hasRole(institutionRole, institution.address)).to.be.false;

      await expect(registry.connect(admin).grantRole(institutionRole, institution.address))
        .to.emit(registry, "RoleGranted")
        .withArgs(institutionRole, institution.address, admin.address);

      expect(await registry.hasRole(institutionRole, institution.address)).to.be.true;

      await expect(registry.connect(admin).revokeRole(institutionRole, institution.address))
        .to.emit(registry, "RoleRevoked")
        .withArgs(institutionRole, institution.address, admin.address);

      expect(await registry.hasRole(institutionRole, institution.address)).to.be.false;
    });

    it("should reject unauthorized accounts attempting to grant INSTITUTION_ROLE", async function () {
      await expect(
        registry.connect(otherAccount).grantRole(institutionRole, otherAccount.address)
      ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Credential Registration", function () {
    beforeEach(async function () {
      await registry.connect(admin).grantRole(institutionRole, institution.address);
    });

    it("should allow authorized institution to register a credential and emit CredentialRegistered", async function () {
      const tx = await registry
        .connect(institution)
        .registerCredential(credentialIdHash, credentialHash, institutionId);

      await expect(tx)
        .to.emit(registry, "CredentialRegistered")
        .withArgs(credentialIdHash, credentialHash, institutionId, (val) => val > 0n);

      const [valid, storedHash, storedInstId, issuedAt] = await registry.verifyCredential(
        credentialIdHash
      );

      expect(valid).to.be.true;
      expect(storedHash).to.equal(credentialHash);
      expect(storedInstId).to.equal(institutionId);
      expect(issuedAt).to.be.gt(0n);
    });

    it("should reject duplicate credentialIdHash with CredentialAlreadyExists", async function () {
      await registry
        .connect(institution)
        .registerCredential(credentialIdHash, credentialHash, institutionId);

      const duplicateHash = ethers.keccak256(ethers.toUtf8Bytes("DIFFERENT_PAYLOAD"));

      await expect(
        registry
          .connect(institution)
          .registerCredential(credentialIdHash, duplicateHash, institutionId)
      )
        .to.be.revertedWithCustomError(registry, "CredentialAlreadyExists")
        .withArgs(credentialIdHash);
    });

    it("should reject credential registration from unauthorized account lacking INSTITUTION_ROLE", async function () {
      await expect(
        registry
          .connect(otherAccount)
          .registerCredential(credentialIdHash, credentialHash, institutionId)
      )
        .to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount")
        .withArgs(otherAccount.address, institutionRole);
    });

    it("should validate input parameters (reject zero hashes or empty institutionId)", async function () {
      await expect(
        registry
          .connect(institution)
          .registerCredential(ethers.ZeroHash, credentialHash, institutionId)
      ).to.be.revertedWithCustomError(registry, "InvalidCredentialIdHash");

      await expect(
        registry
          .connect(institution)
          .registerCredential(credentialIdHash, ethers.ZeroHash, institutionId)
      ).to.be.revertedWithCustomError(registry, "InvalidCredentialHash");

      await expect(
        registry
          .connect(institution)
          .registerCredential(credentialIdHash, credentialHash, "")
      ).to.be.revertedWithCustomError(registry, "EmptyInstitutionId");
    });
  });

  describe("Credential Verification", function () {
    beforeEach(async function () {
      await registry.connect(admin).grantRole(institutionRole, institution.address);
      await registry
        .connect(institution)
        .registerCredential(credentialIdHash, credentialHash, institutionId);
    });

    it("should return valid=true and correct metadata for existing credential", async function () {
      const [valid, storedHash, storedInstId, issuedAt] = await registry.verifyCredential(
        credentialIdHash
      );

      expect(valid).to.be.true;
      expect(storedHash).to.equal(credentialHash);
      expect(storedInstId).to.equal(institutionId);
      expect(issuedAt).to.be.gt(0n);
    });

    it("should return valid=false for non-existent credentialIdHash", async function () {
      const unknownIdHash = ethers.keccak256(ethers.toUtf8Bytes("NON_EXISTENT_CREDENTIAL_ID"));
      const [valid, storedHash, storedInstId, issuedAt] = await registry.verifyCredential(
        unknownIdHash
      );

      expect(valid).to.be.false;
      expect(storedHash).to.equal(ethers.ZeroHash);
      expect(storedInstId).to.equal("");
      expect(issuedAt).to.equal(0n);
    });
  });

  describe("Credential Revocation", function () {
    beforeEach(async function () {
      await registry.connect(admin).grantRole(institutionRole, institution.address);
      await registry
        .connect(institution)
        .registerCredential(credentialIdHash, credentialHash, institutionId);
    });

    it("should allow authorized institution to revoke credential and emit CredentialRevoked", async function () {
      const tx = await registry.connect(institution).revokeCredential(credentialIdHash);

      await expect(tx)
        .to.emit(registry, "CredentialRevoked")
        .withArgs(credentialIdHash, (val) => val > 0n);

      const [valid, storedHash, storedInstId, issuedAt] = await registry.verifyCredential(
        credentialIdHash
      );

      expect(valid).to.be.false;
      expect(storedHash).to.equal(credentialHash);
      expect(storedInstId).to.equal(institutionId);
      expect(issuedAt).to.be.gt(0n);
    });

    it("should reject unauthorized revocation from accounts lacking INSTITUTION_ROLE", async function () {
      await expect(
        registry.connect(otherAccount).revokeCredential(credentialIdHash)
      )
        .to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount")
        .withArgs(otherAccount.address, institutionRole);
    });

    it("should reject revocation of a non-existent credential with CredentialNotFound", async function () {
      const unknownIdHash = ethers.keccak256(ethers.toUtf8Bytes("UNKNOWN_ID_HASH"));

      await expect(
        registry.connect(institution).revokeCredential(unknownIdHash)
      )
        .to.be.revertedWithCustomError(registry, "CredentialNotFound")
        .withArgs(unknownIdHash);
    });

    it("should reject double revocation of an already-revoked credential with CredentialAlreadyRevoked", async function () {
      await registry.connect(institution).revokeCredential(credentialIdHash);

      await expect(
        registry.connect(institution).revokeCredential(credentialIdHash)
      )
        .to.be.revertedWithCustomError(registry, "CredentialAlreadyRevoked")
        .withArgs(credentialIdHash);
    });
  });
});

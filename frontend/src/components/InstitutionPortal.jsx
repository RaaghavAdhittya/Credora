import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Building,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { registerCredentialApi, revokeCredentialApi } from '../services/api';
import { getEtherscanTxUrl } from '../constants/contract';

const SUPPORTED_RECORD_TYPES = [
  { value: 'UG_DEGREE', label: 'Undergraduate Degree (e.g., B.Tech, B.Sc, BA)' },
  { value: 'PG_DEGREE', label: 'Postgraduate Degree (e.g., M.Tech, M.Sc, MBA)' },
  { value: 'BOARD_RESULT_10', label: 'Class X Secondary Examination Result' },
  { value: 'BOARD_RESULT_12', label: 'Class XII Senior Secondary Result' },
  { value: 'DIPLOMA', label: 'Technical / Vocational Diploma' },
  { value: 'CERTIFICATE', label: 'Professional Certificate' },
  { value: 'TRANSCRIPT', label: 'Official Academic Transcript' },
  { value: 'PHD_MILESTONE', label: 'Doctoral / PhD Milestone Defense' },
];

export default function InstitutionPortal({ onVerifyNewlyIssued }) {
  const [subTab, setSubTab] = useState('issue'); // 'issue' | 'revoke'

  // Issue Form State
  const [formData, setFormData] = useState({
    studentIdentifier: 'DEMO-STUDENT-001',
    recordType: 'UG_DEGREE',
    title: 'Bachelor of Technology in Computer Science',
    institutionId: 'VIT-DEMO',
    academicYear: '2022-2026',
    issueDate: new Date().toISOString().split('T')[0],
    documentHash: '',
    program: 'Computer Science and Engineering',
    gpa: '3.92',
  });

  const [previewHash, setPreviewHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Revoke Form State
  const [revokeId, setRevokeId] = useState('');
  const [revokeConfirmed, setRevokeConfirmed] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState(null);
  const [revokeSuccess, setRevokeSuccess] = useState(null);

  // Compute live deterministic Keccak-256 preview
  useEffect(() => {
    try {
      const canonical = {
        academicYear: formData.academicYear.trim(),
        documentHash: formData.documentHash.trim() || null,
        gpa: formData.gpa.trim(),
        institutionId: formData.institutionId.trim(),
        issueDate: formData.issueDate,
        program: formData.program.trim(),
        recordType: formData.recordType,
        studentIdentifier: formData.studentIdentifier.trim(),
        title: formData.title.trim(),
      };
      const jsonStr = JSON.stringify(canonical);
      const hash = ethers.keccak256(ethers.toUtf8Bytes(jsonStr));
      setPreviewHash(hash);
    } catch {
      setPreviewHash('');
    }
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const payload = {
        studentIdentifier: formData.studentIdentifier.trim(),
        recordType: formData.recordType,
        title: formData.title.trim(),
        institutionId: formData.institutionId.trim(),
        academicYear: formData.academicYear.trim() || undefined,
        issueDate: formData.issueDate,
        documentHash: formData.documentHash.trim() || undefined,
        credentialData: {
          program: formData.program.trim(),
          gpa: formData.gpa.trim(),
        },
      };

      const response = await registerCredentialApi(payload);
      setSuccessResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to issue credential on Ethereum Sepolia.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    const targetId = revokeId.trim();
    if (!targetId || !revokeConfirmed) return;

    setRevokeLoading(true);
    setRevokeError(null);
    setRevokeSuccess(null);

    try {
      const response = await revokeCredentialApi(targetId);
      setRevokeSuccess(response.data);
    } catch (err) {
      setRevokeError(err.message || 'Revocation failed on Ethereum Sepolia.');
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadSampleRecord = (type) => {
    if (type === 'UG') {
      setFormData({
        studentIdentifier: 'DEMO-STUDENT-001',
        recordType: 'UG_DEGREE',
        title: 'Bachelor of Technology in Computer Science',
        institutionId: 'VIT-DEMO',
        academicYear: '2022-2026',
        issueDate: new Date().toISOString().split('T')[0],
        documentHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        program: 'Computer Science and Engineering',
        gpa: '3.92',
      });
    } else if (type === 'BOARD_10') {
      setFormData({
        studentIdentifier: 'DEMO-STUDENT-001',
        recordType: 'BOARD_RESULT_10',
        title: 'Secondary School Examination (Class X)',
        institutionId: 'CBSE-BOARD',
        academicYear: '2019-2020',
        issueDate: '2020-05-15',
        documentHash: '0x887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa99',
        program: 'All India Secondary School Certificate',
        gpa: '9.4 CGPA',
      });
    } else if (type === 'PHD') {
      setFormData({
        studentIdentifier: 'DEMO-STUDENT-001',
        recordType: 'PHD_MILESTONE',
        title: 'Doctoral Comprehensive Examination & Proposal',
        institutionId: 'IISC-BANGALORE',
        academicYear: '2026-2027',
        issueDate: new Date().toISOString().split('T')[0],
        documentHash: '0x99aa88bb77cc66dd55ee44ff3300221199aa88bb77cc66dd55ee44ff33002211',
        program: 'Doctor of Philosophy in Cryptography',
        gpa: 'Defended with Distinction',
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-[#252B38] pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setSubTab('issue')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subTab === 'issue'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#11151F] border border-transparent'
            }`}
          >
            Issue Academic Record
          </button>
          <button
            type="button"
            onClick={() => setSubTab('revoke')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subTab === 'revoke'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                : 'text-slate-400 hover:text-rose-300 hover:bg-[#11151F] border border-transparent'
            }`}
          >
            Revoke Academic Record
          </button>
        </div>

        {subTab === 'issue' && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Templates:</span>
            <button
              type="button"
              onClick={() => loadSampleRecord('UG')}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              UG Degree
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => loadSampleRecord('BOARD_10')}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Class 10
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => loadSampleRecord('PHD')}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              PhD
            </button>
          </div>
        )}
      </div>

      {/* ISSUE TAB */}
      {subTab === 'issue' && (
        <div className="glass-panel p-5 sm:p-6 border-[#252B38] bg-[#11151F]/80">
          <div className="pb-3 border-b border-[#252B38] mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" />
              Issue Lifelong Academic Record
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Anchor an accredited educational credential directly to Ethereum Sepolia with zero on-chain student PII.
            </p>
          </div>

          {/* Success Receipt */}
          {successResult && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Academic Record Anchored on Ethereum Sepolia!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-900/60">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                    Credential Identifier
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-white font-semibold">{successResult.credentialId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(successResult.credentialId, 'issuedId')}
                      className="p-1 hover:bg-[#11151F] rounded text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'issuedId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                    Record Type & Title
                  </span>
                  <span className="text-slate-200 font-medium block mt-0.5">
                    {successResult.recordType} — {successResult.title || 'Academic Record'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-emerald-900/60 text-[11px]">
                <a
                  href={getEtherscanTxUrl(successResult.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono"
                >
                  <span>Tx: {successResult.transactionHash.slice(0, 14)}...{successResult.transactionHash.slice(-8)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => onVerifyNewlyIssued && onVerifyNewlyIssued(successResult.credentialId)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all self-start sm:self-auto cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                >
                  Verify On Blockchain →
                </button>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Issuance Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleIssueSubmit} className="space-y-4">
            {/* Row 1: Student Identifier & Record Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student Identifier or 12-Digit APAAR ID *
                </label>
                <input
                  type="text"
                  name="studentIdentifier"
                  required
                  value={formData.studentIdentifier}
                  onChange={handleChange}
                  placeholder="e.g. 12-digit APAAR ID or DEMO-STUDENT-001"
                  className="w-full px-3 py-2 glass-input font-mono text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Academic Record Type *
                </label>
                <select
                  name="recordType"
                  required
                  value={formData.recordType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 glass-input text-slate-100 text-xs focus:border-amber-400 cursor-pointer"
                >
                  {SUPPORTED_RECORD_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value} className="bg-[#11151F] text-slate-100">
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Credential Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Credential Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Bachelor of Technology in Computer Science and Engineering"
                className="w-full px-3 py-2 glass-input text-slate-100 text-xs focus:border-amber-400"
              />
            </div>

            {/* Row 3: Institution ID & Academic Year & Issue Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Issuing Institution ID *
                </label>
                <input
                  type="text"
                  name="institutionId"
                  required
                  value={formData.institutionId}
                  onChange={handleChange}
                  placeholder="e.g. VIT-DEMO or CBSE-BOARD"
                  className="w-full px-3 py-2 glass-input font-mono text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Academic Year / Session
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="e.g. 2022-2026"
                  className="w-full px-3 py-2 glass-input text-slate-100 text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Issue Date *
                </label>
                <input
                  type="date"
                  name="issueDate"
                  required
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 glass-input text-slate-100 text-xs focus:border-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Row 4: Document Hash & Academic Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Document Cryptographic Hash (Optional)
                </label>
                <input
                  type="text"
                  name="documentHash"
                  value={formData.documentHash}
                  onChange={handleChange}
                  placeholder="0x... (Keccak-256 or SHA-256 digest of PDF certificate)"
                  className="w-full px-3 py-2 glass-input font-mono text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  GPA / Grade / Division
                </label>
                <input
                  type="text"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="e.g. 3.92 / First Class"
                  className="w-full px-3 py-2 glass-input text-slate-100 text-xs focus:border-amber-400"
                />
              </div>
            </div>

            {/* Live Cryptographic Preview */}
            <div className="p-3.5 bg-[#0B0E17] border border-[#252B38] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold flex items-center gap-1.5 text-amber-400">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Deterministic Keccak-256 Commitment Digest:
                </span>
                <span className="font-mono text-[10px] text-slate-500">32-byte Solidity standard</span>
              </div>
              <p className="font-mono text-[11px] text-slate-200 break-all select-all leading-relaxed">
                {previewHash || 'Computing commitment digest...'}
              </p>
            </div>

            <button
              id="btn-submit-credential"
              type="submit"
              disabled={loading || !formData.studentIdentifier.trim() || !formData.institutionId.trim()}
              className="w-full py-2.5 rounded-lg btn-gold-primary text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.25)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Submitting Transaction to Sepolia...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-slate-900" />
                  <span>Anchor & Issue Academic Record on Blockchain</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* REVOKE TAB */}
      {subTab === 'revoke' && (
        <div className="glass-panel p-5 sm:p-6 border-[#252B38] bg-[#11151F]/80">
          <div className="pb-3 border-b border-[#252B38] mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Revoke Academic Credential
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Permanently mark a credential as revoked on the Ethereum Sepolia smart contract registry.
            </p>
          </div>

          {/* Revoke Success Notice */}
          {revokeSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-rose-950/30 border border-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Credential Revocation Confirmed on Ethereum Sepolia!</span>
              </div>
              <p className="text-slate-300">
                Credential ID <span className="font-mono font-semibold text-white">{revokeSuccess.credentialId}</span> is now permanently revoked on Sepolia.
              </p>
              {revokeSuccess.transactionHash && (
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <a
                    href={getEtherscanTxUrl(revokeSuccess.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-mono"
                  >
                    <span>Tx: {revokeSuccess.transactionHash.slice(0, 14)}...{revokeSuccess.transactionHash.slice(-8)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Revoke Error Notice */}
          {revokeError && (
            <div className="mb-4 p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Revocation Failed:</span>
                <span>{revokeError}</span>
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/50 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p className="text-[11px] leading-relaxed">
              Revocation is an irreversible, permanent on-chain transaction. Once confirmed on Ethereum Sepolia, the credential will permanently return <strong className="font-mono text-rose-400">REVOKED</strong> on all future independent verification queries.
            </p>
          </div>

          <form onSubmit={handleRevokeSubmit} className="space-y-4">
            <div>
              <label htmlFor="revoke-credential-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                Credential Identifier to Revoke *
              </label>
              <input
                id="revoke-credential-input"
                type="text"
                required
                value={revokeId}
                onChange={(e) => setRevokeId(e.target.value)}
                placeholder="e.g. CRED-MVB9R883-53EAF478"
                className="w-full px-3 py-2 glass-input font-mono text-xs focus:border-rose-500"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="revoke-confirm-checkbox"
                type="checkbox"
                checked={revokeConfirmed}
                onChange={(e) => setRevokeConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#252B38] bg-[#0B0E17] text-rose-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="revoke-confirm-checkbox" className="text-[11px] text-slate-400 select-none cursor-pointer leading-normal">
                I confirm that I am an authorized institutional representative and that this revocation is permanent and final on Ethereum Sepolia.
              </label>
            </div>

            <button
              id="btn-confirm-revoke"
              type="submit"
              disabled={revokeLoading || !revokeId.trim() || !revokeConfirmed}
              className="w-full py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.2)]"
            >
              {revokeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Revocation...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Revoke Credential</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


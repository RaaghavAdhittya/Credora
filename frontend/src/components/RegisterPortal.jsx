import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Award,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Shield,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { registerCredentialApi } from '../services/api';
import { getEtherscanTxUrl } from '../constants/contract';

export default function RegisterPortal({ onVerifyNewlyIssued }) {
  const [formData, setFormData] = useState({
    studentIdentifier: 'DEMO-STUDENT-002',
    institutionId: 'VIT-DEMO',
    program: 'Bachelor of Technology in Computer Science',
    graduationYear: '2026',
    gpa: '3.88',
    issueDate: new Date().toISOString().split('T')[0],
  });

  const [previewHash, setPreviewHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Compute live deterministic Keccak-256 preview
  useEffect(() => {
    try {
      const canonical = {
        gpa: formData.gpa.trim(),
        graduationYear: formData.graduationYear.trim(),
        institutionId: formData.institutionId.trim(),
        issueDate: formData.issueDate,
        program: formData.program.trim(),
        studentIdentifier: formData.studentIdentifier.trim(),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const payload = {
        studentIdentifier: formData.studentIdentifier.trim(),
        institutionId: formData.institutionId.trim(),
        issueDate: formData.issueDate,
        credentialData: {
          program: formData.program.trim(),
          graduationYear: formData.graduationYear.trim(),
          gpa: formData.gpa.trim(),
        },
      };

      const response = await registerCredentialApi(payload);
      setSuccessResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to issue credential on Sepolia blockchain.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Issue Academic Credential</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Anchor a tamper-proof credential hash directly onto the Ethereum Sepolia smart contract.
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successResult && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl shadow-emerald-500/10 animate-fadeIn">
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-base mb-4">
              <CheckCircle2 className="w-6 h-6" />
              <span>Credential Successfully Anchored on Sepolia!</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Generated Credential Identifier:</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-emerald-300 font-bold truncate">
                    {successResult.credentialId}
                  </span>
                  <button
                    onClick={() => handleCopy(successResult.credentialId, 'res-id')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'res-id' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Anchored Document Hash (Keccak-256):</span>
                <span className="font-mono text-slate-300 truncate block">
                  {successResult.credentialHash}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <a
                  href={getEtherscanTxUrl(successResult.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-mono text-xs"
                >
                  <span>Tx: {successResult.transactionHash.slice(0, 10)}...{successResult.transactionHash.slice(-8)}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => onVerifyNewlyIssued && onVerifyNewlyIssued(successResult.credentialId)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <span>Verify Credential Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Registration Transaction Failed:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Credential Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="studentIdentifier" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student Reference Identifier *
              </label>
              <input
                id="studentIdentifier"
                name="studentIdentifier"
                type="text"
                required
                value={formData.studentIdentifier}
                onChange={handleChange}
                placeholder="e.g. DEMO-STUDENT-002"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Never enter raw Aadhaar or real APAAR ID.
              </span>
            </div>

            <div>
              <label htmlFor="institutionId" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institution Code / AISHE ID *
              </label>
              <input
                id="institutionId"
                name="institutionId"
                type="text"
                required
                value={formData.institutionId}
                onChange={handleChange}
                placeholder="e.g. VIT-DEMO"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="program" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Academic Program / Degree *
              </label>
              <input
                id="program"
                name="program"
                type="text"
                required
                value={formData.program}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="graduationYear" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Graduation Year
              </label>
              <input
                id="graduationYear"
                name="graduationYear"
                type="text"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="2026"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gpa" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cumulative GPA / Grade
              </label>
              <input
                id="gpa"
                name="gpa"
                type="text"
                value={formData.gpa}
                onChange={handleChange}
                placeholder="e.g. 3.88"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>

            <div>
              <label htmlFor="issueDate" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Issue Date *
              </label>
              <input
                id="issueDate"
                name="issueDate"
                type="date"
                required
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Live Hash Calculation Preview */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Live Deterministic Digest Preview (Keccak-256):
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">Computed Client-Side</span>
            </div>
            <div className="font-mono text-xs text-indigo-300 truncate bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              {previewHash || '0x...'}
            </div>
          </div>

          <button
            id="btn-submit-register"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Sepolia & Mining Block...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Anchor Credential to Sepolia</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

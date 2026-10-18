import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Calendar,
  Hash,
  Database,
  Blocks,
  ArrowLeft,
  Award,
  Cpu,
} from 'lucide-react';
import { CONTRACT_ADDRESS, getEtherscanAddressUrl, getEtherscanTxUrl } from '../constants/contract';

export default function VerificationResultCard({ result, onReset }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!result) return null;

  const isVerified = result.verificationResult === 'VERIFIED' && result.isValid;
  const isRevoked = result.verificationResult === 'REVOKED';
  const isNotFound = result.verificationResult === 'NOT_FOUND';
  const data = result.data || {};
  const blockchain = data.blockchain || {};

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className={`glass-panel overflow-hidden border transition-all ${
        isVerified
          ? 'border-emerald-500/40 shadow-[0_0_24px_rgba(34,197,94,0.1)]'
          : isRevoked
          ? 'border-rose-500/40 shadow-[0_0_24px_rgba(244,63,94,0.1)]'
          : 'border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.1)]'
      }`}>
        {/* Verification Status Header Banner */}
        <div
          className={`p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isVerified
              ? 'bg-emerald-950/25 border-emerald-900/50'
              : isRevoked
              ? 'bg-rose-950/25 border-rose-900/50'
              : 'bg-amber-950/25 border-amber-900/50'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isVerified
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isRevoked
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isVerified ? (
                <ShieldCheck className="w-6 h-6" />
              ) : isRevoked ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    isVerified
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : isRevoked
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}
                >
                  {result.verificationResult || 'STATUS UNKNOWN'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {isVerified
                    ? 'Dual-Consensus Verified on Sepolia'
                    : isRevoked
                    ? 'Revoked by Issuing Institution'
                    : 'Unregistered Identifier'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {isVerified
                  ? 'Cryptographic Credential Authenticity Confirmed'
                  : isRevoked
                  ? 'Credential Revocation Recorded on Blockchain'
                  : 'Credential Record Not Found'}
              </h3>
            </div>
          </div>

          <button
            onClick={onReset}
            className="self-start sm:self-center px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white btn-secondary-surface transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Verify Another</span>
          </button>
        </div>

        {/* Verification Details Table / Dossier */}
        {isNotFound ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p className="leading-relaxed">
              The provided Credential Identifier does not match any registered record in the Credora database or on Ethereum Sepolia.
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5 bg-[#11151F]/90">
            {/* Metadata Attribute Table */}
            <div className="border border-[#252B38] rounded-xl overflow-hidden bg-[#0B0E17]/80">
              <table className="w-full text-left text-xs border-collapse">
                <tbody className="divide-y divide-[#252B38]">
                  <tr className="hover:bg-amber-500/[0.02]">
                    <td className="py-2.5 px-3.5 text-slate-400 font-medium w-48 border-r border-[#252B38]">
                      Credential Identifier
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{data.credentialId}</span>
                        <button
                          onClick={() => handleCopy(data.credentialId, 'id')}
                          className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Copy Credential ID"
                        >
                          {copiedKey === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-amber-500/[0.02]">
                    <td className="py-2.5 px-3.5 text-slate-400 font-medium border-r border-[#252B38]">
                      Record Type & Title
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-[#171D2B] border border-amber-500/25 font-mono text-[11px] text-amber-300 font-medium mr-2">
                        {data.recordType || 'UG_DEGREE'}
                      </span>
                      <span className="font-semibold text-white">{data.title || 'Academic Record'}</span>
                      {data.academicYear && (
                        <span className="text-slate-400 font-mono text-[11px] ml-2">
                          (AY: {data.academicYear})
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-amber-500/[0.02]">
                    <td className="py-2.5 px-3.5 text-slate-400 font-medium border-r border-[#252B38]">
                      Issuing Institution
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-200 font-semibold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{data.institutionId || blockchain.onChainInstitutionId || 'N/A'}</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-amber-500/[0.02]">
                    <td className="py-2.5 px-3.5 text-slate-400 font-medium border-r border-[#252B38]">
                      Issue Date
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-300">
                      {formatDate(data.issueDate)}
                    </td>
                  </tr>

                  <tr className="hover:bg-amber-500/[0.02]">
                    <td className="py-2.5 px-3.5 text-slate-400 font-medium border-r border-[#252B38]">
                      Registry & Consensus State
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              data.dbStatus === 'ISSUED' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          ></span>
                          <span className="text-slate-200">DB: {data.dbStatus || 'UNKNOWN'}</span>
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              blockchain.valid ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          ></span>
                          <span className="text-slate-200">
                            On-Chain: {blockchain.valid ? 'VALID' : isRevoked ? 'REVOKED' : 'UNVERIFIED'}
                          </span>
                        </span>
                      </div>
                    </td>
                  </tr>

                  {data.documentHash && (
                    <tr className="hover:bg-amber-500/[0.02]">
                      <td className="py-2.5 px-3.5 text-slate-400 font-medium border-r border-[#252B38]">
                        Document Cryptographic Hash
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-xs text-slate-300 truncate" title={data.documentHash}>
                        {data.documentHash}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cryptographic Consensus Audit */}
            <div className="border border-[#252B38] rounded-xl p-4 bg-[#0B0E17]/80 space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px] font-mono">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Keccak-256 Cryptographic Consensus</span>
                </span>
                {data.hashMatch && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-semibold self-start sm:self-auto">
                    100% Cryptographic Match Confirmed
                  </span>
                )}
              </div>

              <div className="space-y-2 font-mono text-[11px] pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-[#11151F] border border-[#252B38] gap-1">
                  <span className="text-slate-400 text-[10px] uppercase w-48">Canonical Recomputed:</span>
                  <span className="truncate text-slate-200 select-all">{data.computedHash}</span>
                  <button
                    onClick={() => handleCopy(data.computedHash, 'hash')}
                    className="text-slate-400 hover:text-amber-400 shrink-0 cursor-pointer p-0.5"
                    title="Copy Recomputed Hash"
                  >
                    {copiedKey === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {blockchain.onChainHash && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-[#11151F] border border-[#252B38] gap-1">
                    <span className="text-slate-400 text-[10px] uppercase w-48">On-Chain Commitment:</span>
                    <span className="truncate text-slate-200 select-all">{blockchain.onChainHash}</span>
                    <button
                      onClick={() => handleCopy(blockchain.onChainHash, 'onChainHash')}
                      className="text-slate-400 hover:text-amber-400 shrink-0 cursor-pointer p-0.5"
                      title="Copy On-Chain Hash"
                    >
                      {copiedKey === 'onChainHash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Contract Proof Anchor */}
            <div className="p-3.5 rounded-xl bg-[#0B0E17]/80 border border-[#252B38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="font-mono text-[11px]">
                <span className="text-slate-400 block font-sans text-xs">Ethereum Sepolia Registry Contract:</span>
                <span className="text-amber-400 font-semibold">{CONTRACT_ADDRESS}</span>
              </div>
              <a
                href={getEtherscanAddressUrl(CONTRACT_ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-secondary-surface text-slate-200 hover:text-white border border-[#252B38] text-xs font-medium transition-all"
              >
                <span>View on Sepolia Etherscan</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


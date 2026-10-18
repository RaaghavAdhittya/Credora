import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, ShieldCheck, ShieldAlert, CheckCircle2, QrCode } from 'lucide-react';
import { verifyCredentialApi } from '../services/api';
import { DEMO_CREDENTIAL_ID } from '../constants/contract';
import VerificationResultCard from './VerificationResultCard';
import QrScannerModal from './QrScannerModal';

const DEMO_REVOKED_CREDENTIAL_ID = 'CRED-MVBAI8A2-C56895C7';

export default function VerifyPortal({ initialCredentialId }) {
  const [credentialId, setCredentialId] = useState(initialCredentialId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (initialCredentialId && initialCredentialId.trim()) {
      setCredentialId(initialCredentialId.trim());
      triggerVerification(initialCredentialId.trim());
    }
  }, [initialCredentialId]);

  const triggerVerification = async (targetId) => {
    if (!targetId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await verifyCredentialApi(targetId);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    await triggerVerification(credentialId.trim());
  };

  const handleQuickDemo = (demoId) => {
    setCredentialId(demoId);
    setError(null);
    setResult(null);
    triggerVerification(demoId);
  };

  const handleScanSuccess = (scannedId) => {
    if (!scannedId) return;
    setCredentialId(scannedId);
    setError(null);
    setResult(null);
    triggerVerification(scannedId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input Box */}
      <div className="glass-panel p-5 sm:p-6 border-[#252B38] bg-[#11151F]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Independent Credential Audit
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Verify cryptographic authenticity, institutional provenance, and blockchain validity in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono">
            <span className="text-slate-500">Samples:</span>
            <button
              id="btn-quick-demo"
              type="button"
              onClick={() => handleQuickDemo(DEMO_CREDENTIAL_ID)}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Issued Demo</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => handleQuickDemo(DEMO_REVOKED_CREDENTIAL_ID)}
              className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium cursor-pointer transition-colors"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Revoked Demo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="verify-input"
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="Enter Credential ID (e.g. CRED-MVB9R883-53EAF478)"
              className="w-full pl-9 pr-3 py-2 glass-input font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-amber-400"
            />
          </div>

          <button
            id="btn-scan-qr"
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-2 rounded-lg btn-secondary-surface text-slate-200 hover:text-amber-300 border border-[#252B38] hover:border-amber-500/40 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            title="Scan Credential QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan QR</span>
          </button>

          <button
            id="btn-submit-verify"
            type="submit"
            disabled={loading || !credentialId.trim()}
            className="px-5 py-2 rounded-lg btn-gold-primary text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
                <span>Verifying On-Chain...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                <span>Verify Credential</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-slate-400 pt-2.5 border-t border-[#252B38]/80 font-mono">
          Consensus audit: Performs dual-layer state confirmation between MySQL off-chain metadata and Ethereum Sepolia smart contract.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Verification Query Failed:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Verification Result Card */}
      {result && (
        <VerificationResultCard
          result={result}
          onReset={() => {
            setResult(null);
            setCredentialId('');
          }}
        />
      )}

      {/* QR Code Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}




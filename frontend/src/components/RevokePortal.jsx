import React, { useState } from 'react';
import {
  ShieldAlert,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { revokeCredentialApi } from '../services/api';
import { getEtherscanTxUrl } from '../constants/contract';

export default function RevokePortal({ onVerifyRevoked }) {
  const [credentialId, setCredentialId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleRevoke = async (e) => {
    e.preventDefault();
    const targetId = credentialId.trim();
    if (!targetId || !confirmed) return;

    setLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await revokeCredentialApi(targetId);
      setSuccessData(response.data);
    } catch (err) {
      setError(err.message || 'Revocation failed on Sepolia blockchain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border-rose-500/20 relative">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Revoke Academic Credential</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently mark a credential as revoked on the Ethereum Sepolia smart contract.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successData && (
          <div className="mb-6 p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Credential Revocation Confirmed on Blockchain!</span>
            </div>

            <p className="text-slate-300">
              Credential Identifier <span className="font-mono font-bold text-white">{successData.credentialId}</span> is now permanently revoked.
            </p>

            {successData.transactionHash && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <a
                  href={getEtherscanTxUrl(successData.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-mono"
                >
                  <span>Tx: {successData.transactionHash.slice(0, 12)}...{successData.transactionHash.slice(-8)}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => onVerifyRevoked && onVerifyRevoked(successData.credentialId)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Verify Revocation Status
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Revocation Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Warning Notice */}
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Revocation is an irreversible on-chain transaction. Once confirmed on Ethereum Sepolia, the credential will permanently return <strong className="font-mono">REVOKED</strong> on all verification inquiries.
          </p>
        </div>

        <form onSubmit={handleRevoke} className="space-y-5">
          <div>
            <label htmlFor="revoke-credential-id" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Credential Identifier to Revoke *
            </label>
            <input
              id="revoke-credential-id"
              type="text"
              required
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="e.g. CRED-MVB9R883-53EAF478"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="revoke-confirm-checkbox"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="revoke-confirm-checkbox" className="text-xs text-slate-400 select-none cursor-pointer">
              I acknowledge that I am an authorized institutional representative and that this revocation will be permanently recorded on Ethereum Sepolia.
            </label>
          </div>

          <button
            id="btn-submit-revoke"
            type="submit"
            disabled={loading || !credentialId.trim() || !confirmed}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Revocation to Blockchain...</span>
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
    </div>
  );
}

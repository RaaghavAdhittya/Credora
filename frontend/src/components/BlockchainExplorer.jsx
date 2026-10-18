import React, { useState, useEffect } from 'react';
import {
  Blocks,
  ExternalLink,
  Copy,
  Check,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Database,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { getBlockchainTransactionsApi } from '../services/api';
import {
  CONTRACT_ADDRESS,
  getEtherscanAddressUrl,
  getEtherscanTxUrl,
  getEtherscanBlockUrl,
} from '../constants/contract';

export default function BlockchainExplorer({ onVerifyCredential }) {
  const [transactions, setTransactions] = useState([]);
  const [contractInfo, setContractInfo] = useState({
    contractAddress: CONTRACT_ADDRESS,
    network: 'Ethereum Sepolia Testnet',
    chainId: 11155111,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBlockchainTransactionsApi(50);
      if (res && res.status === 'success') {
        setTransactions(res.data.transactions || []);
        setContractInfo({
          contractAddress: res.data.contractAddress || CONTRACT_ADDRESS,
          network: res.data.network || 'Ethereum Sepolia Testnet',
          chainId: res.data.chainId || 11155111,
          total: res.data.total || 0,
        });
      } else {
        throw new Error(res.message || 'Unable to fetch blockchain transactions.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions from Sepolia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Pending Confirmation';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (tx.credentialId && tx.credentialId.toLowerCase().includes(q)) ||
      (tx.transactionHash && tx.transactionHash.toLowerCase().includes(q)) ||
      (tx.institutionId && tx.institutionId.toLowerCase().includes(q)) ||
      (tx.action && tx.action.toLowerCase().includes(q)) ||
      (tx.recordType && tx.recordType.toLowerCase().includes(q)) ||
      (tx.blockNumber && String(tx.blockNumber).includes(q))
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Contract & Ledger Header Summary */}
      <div className="glass-panel p-5 sm:p-6 border-[#252B38] bg-[#11151F]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252B38]">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
                <Blocks className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono">
                Blockchain Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Public ledger of academic credential transactions anchored to the Credora registry contract.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* View Full Sepolia Chain Button */}
            <a
              href={getEtherscanAddressUrl(contractInfo.contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171D2B] hover:bg-[#1C2333] border border-amber-500/30 text-amber-300 text-xs font-medium transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              title="View full transaction list on Sepolia Etherscan"
            >
              <span>View Full Sepolia Chain</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>

            <button
              type="button"
              onClick={fetchTransactions}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-secondary-surface text-xs font-medium text-slate-200 cursor-pointer disabled:opacity-50"
              title="Refresh Transactions from Sepolia"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Ledger Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Registry Smart Contract
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-mono text-xs text-amber-400/90 font-semibold truncate" title={contractInfo.contractAddress}>
                {contractInfo.contractAddress}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(contractInfo.contractAddress, 'contract')}
                className="p-1 hover:bg-[#171D2B] rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Address"
              >
                {copiedKey === 'contract' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <a
                href={getEtherscanAddressUrl(contractInfo.contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-[#171D2B] rounded text-slate-400 hover:text-amber-400 transition-colors"
                title="View on Sepolia Etherscan"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Consensus Network
            </span>
            <span className="font-medium text-slate-200 block mt-1">
              {contractInfo.network} (Chain ID: {contractInfo.chainId})
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Confirmed Blockchain Ledger Events
            </span>
            <span className="font-mono text-sm font-semibold text-white block mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {contractInfo.total} Confirmed Transactions
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-3 bg-[#11151F]/70 border-[#252B38]">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Credential ID, Tx Hash, Institution..."
            className="w-full pl-8 pr-3 py-1.5 glass-input text-xs font-mono placeholder-slate-500 text-slate-200"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-amber-400 font-semibold">{filteredTransactions.length}</span> of {transactions.length} records
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Failed to Fetch Transactions:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="glass-panel overflow-hidden border-[#252B38] bg-[#11151F]/80">
        {loading && transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
            <span>Querying verified transactions from Ethereum Sepolia...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Blocks className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No Transactions Found</p>
            <p className="text-slate-500 mt-1">No recorded blockchain events match your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0B0E17]/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-[#252B38] font-mono">
                  <th className="py-3 px-3.5 font-semibold">Tx Hash</th>
                  <th className="py-3 px-3.5 font-semibold">Block</th>
                  <th className="py-3 px-3.5 font-semibold">Timestamp</th>
                  <th className="py-3 px-3.5 font-semibold">Action</th>
                  <th className="py-3 px-3.5 font-semibold">Credential ID</th>
                  <th className="py-3 px-3.5 font-semibold">Institution</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252B38]/60">
                {filteredTransactions.map((tx, idx) => {
                  const isRevoked = tx.action === 'REVOKED' || tx.status === 'REVOKED';

                  return (
                    <tr key={tx.transactionHash || idx} className="hover:bg-amber-500/[0.03] transition-colors">
                      {/* Tx Hash */}
                      <td className="py-3 px-3.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={getEtherscanTxUrl(tx.transactionHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-medium"
                            title={tx.transactionHash}
                          >
                            <span>
                              {tx.transactionHash.slice(0, 10)}...{tx.transactionHash.slice(-6)}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.transactionHash, `tx-${idx}`)}
                            className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            title="Copy Tx Hash"
                          >
                            {copiedKey === `tx-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Block */}
                      <td className="py-3 px-3.5 font-mono">
                        {tx.blockNumber ? (
                          <a
                            href={getEtherscanBlockUrl(tx.blockNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-white hover:underline flex items-center gap-1"
                          >
                            <span>#{tx.blockNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                          </a>
                        ) : (
                          <span className="text-slate-500">Confirmed</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap">
                        {formatDate(tx.timestamp)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-rose-950/60 text-rose-400 border border-rose-800">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            REVOKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            ISSUED
                          </span>
                        )}
                      </td>

                      {/* Credential ID */}
                      <td className="py-3 px-3.5 font-mono">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-semibold">{tx.credentialId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.credentialId, `cid-${idx}`)}
                            className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            title="Copy Credential ID"
                          >
                            {copiedKey === `cid-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {tx.recordType && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                            {tx.recordType}
                          </span>
                        )}
                      </td>

                      {/* Institution */}
                      <td className="py-3 px-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {tx.institutionId || '—'}
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onVerifyCredential && onVerifyCredential(tx.credentialId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171D2B] hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-[#252B38] hover:border-amber-500/40 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          <span>Verify</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Explanatory Footer */}
      <div className="text-[11px] text-slate-400 glass-panel p-3.5 border-[#252B38] flex items-start gap-2.5">
        <Database className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          This ledger displays authentic cryptographic transactions anchored directly to the Credora registry smart contract on Ethereum Sepolia. Transactions represent immutable Keccak-256 commitments without storing raw student names, Aadhaar numbers, or student PII on-chain.
        </p>
      </div>
    </div>
  );
}


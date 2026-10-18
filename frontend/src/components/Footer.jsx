import React from 'react';
import { Shield, ExternalLink, Cpu, Lock } from 'lucide-react';
import { CONTRACT_ADDRESS, getEtherscanAddressUrl } from '../constants/contract';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#252B38] bg-[#0B0E17]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div>
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Zero-PII Sovereign Privacy</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-400">
              Student names, Aadhaar details, marks, and personal records are never broadcast on the public blockchain.
              Deterministic Keccak-256 cryptographic commitments and validity states are anchored on Ethereum Sepolia.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs mb-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Registry Smart Contract</span>
            </div>
            <p className="mb-1 text-[11px]">Ethereum Sepolia Testnet Registry:</p>
            <a
              href={getEtherscanAddressUrl(CONTRACT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-amber-400 hover:text-amber-300 break-all text-[11px] hover:underline"
            >
              <span>{CONTRACT_ADDRESS}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs mb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Protocol Stack</span>
            </div>
            <ul className="space-y-1 font-mono text-[10px] text-slate-400">
              <li>• Contract: Solidity 0.8.24 & OpenZeppelin</li>
              <li>• Network: Ethereum Sepolia (Chain ID 11155111)</li>
              <li>• Server & DB: Node.js, Express & MySQL 8</li>
              <li>• Identity: Protected APAAR Pseudonym Hash</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#252B38]/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© 2026 Credora. Sovereign Academic Identity & Verification Network.</p>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="text-slate-400">Cryptographically Anchored on Ethereum</span>
          </div>
        </div>
      </div>
    </footer>
  );
}



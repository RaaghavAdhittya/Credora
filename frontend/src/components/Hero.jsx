import React from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Building2,
  SearchCheck,
  Blocks,
  ArrowRight,
  Lock,
  Cpu,
  FileCheck2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function Hero({ activeRole, setActiveRole }) {
  const steps = [
    {
      step: '01',
      title: 'Institution',
      desc: 'Accredited Issuer',
      icon: Building2,
    },
    {
      step: '02',
      title: 'Academic Credential',
      desc: 'Degrees, Board, Transcripts',
      icon: GraduationCap,
    },
    {
      step: '03',
      title: 'Cryptographic Proof',
      desc: 'Zero-PII Keccak-256 Digest',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'Ethereum Sepolia',
      desc: 'Immutable On-Chain Anchor',
      icon: Blocks,
    },
    {
      step: '05',
      title: 'Independent Verification',
      desc: 'Trustless Instant Proof',
      icon: ShieldCheck,
    },
  ];

  const roleDescriptions = {
    student: {
      tag: 'STUDENT REGISTRY',
      title: 'Academic Passport & Lifelong Record',
      detail: 'View verified degrees, transcripts, board examinations, and doctoral milestones linked to your protected APAAR identity.',
    },
    institution: {
      tag: 'ACCREDITED ISSUER',
      title: 'Institutional Issuance & Revocation',
      detail: 'Anchor academic milestones directly to Ethereum Sepolia with deterministic Keccak-256 cryptographic commitments.',
    },
    verifier: {
      tag: 'INDEPENDENT AUDIT',
      title: 'Cryptographic Credential Verification',
      detail: 'Independently inspect credential authenticity, institutional provenance, and blockchain validity in real time.',
    },
    blockchain: {
      tag: 'PUBLIC REGISTRY',
      title: 'Ethereum Sepolia Blockchain Ledger',
      detail: 'Explore live on-chain credential events, transaction hashes, block numbers, and smart contract commitments.',
    },
  };

  const currentRole = roleDescriptions[activeRole] || roleDescriptions.student;

  return (
    <div className="pt-2 pb-6 space-y-7">
      {/* Product Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-9 border-[#252B38] bg-gradient-to-b from-[#11151F]/90 via-[#0B0E17]/80 to-[#080B12]/90">
        {/* Subtle Warm Gold Radial Glow */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Top Protocol Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171D2B]/80 border border-amber-500/25 text-amber-400 text-xs font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="font-semibold tracking-wide uppercase text-[11px]">
              Credora Academic Identity Network
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-[11px]">Ethereum Sepolia</span>
          </div>

          {/* Headline & Subtitle */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your academic record,{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              verified for life.
            </span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
            One identity. Every achievement. Cryptographically verifiable.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            A sovereign, zero-PII academic verification protocol connecting APAAR identifiers to immutable cryptographic proofs on Ethereum. Off-chain privacy meets decentralized mathematical certainty.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="hero-btn-student"
              onClick={() => {
                setActiveRole('student');
                document.getElementById('portal-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                activeRole === 'student'
                  ? 'btn-gold-primary shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                  : 'btn-gold-primary'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>View Academic Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="hero-btn-verify"
              onClick={() => {
                setActiveRole('verifier');
                document.getElementById('portal-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                activeRole === 'verifier'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'btn-secondary-surface text-slate-200 hover:text-white hover:border-slate-700'
              }`}
            >
              <SearchCheck className="w-4 h-4 text-amber-400" />
              <span>Verify Credential</span>
            </button>

            <button
              type="button"
              id="hero-btn-institution"
              onClick={() => {
                setActiveRole('institution');
                document.getElementById('portal-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeRole === 'institution'
                  ? 'bg-[#171D2B] text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#11151F] border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Institution Portal</span>
            </button>
          </div>
        </div>

        {/* Floating Trust Protocol Badges */}
        <div className="mt-8 pt-5 border-t border-[#252B38]/80 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B12]/80 border border-[#252B38]">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Zero-PII On-Chain</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B12]/80 border border-[#252B38]">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Deterministic Keccak-256</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B12]/80 border border-[#252B38]">
            <Blocks className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Ethereum Sepolia (11155111)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080B12]/80 border border-[#252B38]">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Dual Consensus Validation</span>
          </div>
        </div>
      </div>

      {/* Visual Flow: How Credora Works */}
      <div className="glass-panel p-5 sm:p-6 border-[#252B38]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#252B38]">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Architecture & Lifecycle
            </h2>
            <p className="text-sm font-bold text-white mt-0.5">
              How Credora Works
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Zero-Trust Sovereign Verification
          </span>
        </div>

        {/* 5-Step Connected Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-[#0B0E17]/90 border border-[#252B38] hover:border-amber-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400/80 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {item.step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>

                {/* Arrow connector for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Section Header Bar */}
      <div id="portal-section" className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold block">
            {currentRole.tag}
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            {currentRole.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentRole.detail}
          </p>
        </div>
      </div>
    </div>
  );
}




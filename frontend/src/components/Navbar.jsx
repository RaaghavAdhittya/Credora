import React from 'react';
import { ShieldCheck, ExternalLink, GraduationCap, Building2, SearchCheck, Blocks, Sparkles } from 'lucide-react';
import { CONTRACT_ADDRESS, getEtherscanAddressUrl } from '../constants/contract';

export default function Navbar({ activeRole, setActiveRole, backendStatus }) {
  const navItems = [
    {
      id: 'student',
      label: 'Academic Passport',
      rolePrefix: 'Student',
      icon: GraduationCap,
    },
    {
      id: 'institution',
      label: 'Issue Record',
      rolePrefix: 'Institution',
      icon: Building2,
    },
    {
      id: 'verifier',
      label: 'Verify Credential',
      rolePrefix: 'Verifier',
      icon: SearchCheck,
    },
    {
      id: 'blockchain',
      label: 'Blockchain Ledger',
      rolePrefix: 'Network',
      icon: Blocks,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080B12]/85 backdrop-blur-md border-b border-[#252B38]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            onClick={() => setActiveRole('student')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400/50 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] transition-all">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-mono flex items-center gap-1">
                  CREDORA
                  <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#11151F] border border-[#252B38] text-amber-400/90 font-medium">
                  APAAR
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveRole(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.12)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#11151F] border border-transparent hover:border-[#252B38]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline text-[11px] text-slate-500 font-normal">
                    {item.rolePrefix} —
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Subtle Network & Registry Status */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11151F] border border-[#252B38] text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Sepolia</span>
              <span className="text-slate-500 text-[10px]">11155111</span>
            </div>

            <a
              href={getEtherscanAddressUrl(CONTRACT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#11151F] border border-[#252B38] text-[11px] font-mono text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-colors"
              title="View Registry Contract on Sepolia Etherscan"
            >
              <span>{CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}




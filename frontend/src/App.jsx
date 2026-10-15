import React from 'react';

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          APAAR Blockchain Verifier
        </h1>
        <p className="mt-4 text-base text-slate-400">
          Privacy-preserving blockchain-based verification system for APAAR-linked academic credentials.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Repository Initialized
        </div>
      </div>
    </div>
  );
}

export default App;

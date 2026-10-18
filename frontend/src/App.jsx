import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StudentPassportPortal from './components/StudentPassportPortal';
import InstitutionPortal from './components/InstitutionPortal';
import VerifyPortal from './components/VerifyPortal';
import BlockchainExplorer from './components/BlockchainExplorer';
import Footer from './components/Footer';
import { checkBackendHealth } from './services/api';

function App() {
  const [activeRole, setActiveRole] = useState('student'); // 'student' | 'institution' | 'verifier' | 'blockchain'
  const [backendStatus, setBackendStatus] = useState('checking');
  const [prefilledVerifyId, setPrefilledVerifyId] = useState('');

  useEffect(() => {
    async function checkHealth() {
      const res = await checkBackendHealth();
      setBackendStatus(res.status === 'ok' ? 'online' : 'offline');
    }
    checkHealth();

    // Check for QR verification link or direct credential ID parameter
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCredentialId = params.get('verify') || params.get('id');
      if (urlCredentialId && urlCredentialId.trim()) {
        setPrefilledVerifyId(urlCredentialId.trim());
        setActiveRole('verifier');
      }
    } catch {
      // Ignore URL parsing issues
    }
  }, []);

  const handleVerifyCredential = (credentialId) => {
    setPrefilledVerifyId(credentialId);
    setActiveRole('verifier');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B12] text-slate-100 selection:bg-amber-500/20 selection:text-amber-200">
      <Navbar
        activeRole={activeRole}
        setActiveRole={(role) => {
          setActiveRole(role);
          if (role !== 'verifier') {
            setPrefilledVerifyId('');
          }
        }}
        backendStatus={backendStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <Hero activeRole={activeRole} setActiveRole={setActiveRole} />

        <div className="mt-2">
          {activeRole === 'student' && (
            <StudentPassportPortal onVerifyCredential={handleVerifyCredential} />
          )}
          {activeRole === 'institution' && (
            <InstitutionPortal onVerifyNewlyIssued={handleVerifyCredential} />
          )}
          {activeRole === 'verifier' && (
            <VerifyPortal initialCredentialId={prefilledVerifyId} />
          )}
          {activeRole === 'blockchain' && (
            <BlockchainExplorer onVerifyCredential={handleVerifyCredential} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;



import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  X,
  Copy,
  Check,
  Download,
  ShieldCheck,
  ExternalLink,
  Building2,
  Calendar,
  Lock,
  ArrowUpRight,
} from 'lucide-react';

export default function CredentialQrModal({ credential, onClose, onVerify }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState(null);

  if (!credential) return null;

  // Safe verification reference only: no APAAR ID, no protected reference, no PII
  const verificationUrl = `${window.location.origin}/?verify=${encodeURIComponent(credential.credentialId)}`;

  useEffect(() => {
    async function generateQr() {
      try {
        setQrError(null);
        // Generate high-resolution, high-contrast QR code
        const url = await QRCode.toDataURL(verificationUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#080B12',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setQrDataUrl(url);
      } catch (err) {
        setQrError(err.message || 'Failed to render QR Code.');
      }
    }
    generateQr();
  }, [credential.credentialId, verificationUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `credora-${credential.credentialId}-qr.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md glass-panel p-6 border-[#252B38] bg-[#11151F] text-slate-100 rounded-2xl shadow-[0_0_32px_rgba(245,158,11,0.15)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#171D2B] transition-colors cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Share Credential Verification
            </h3>
            <p className="text-[11px] text-slate-400">
              Zero-PII verification reference for Ethereum Sepolia
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[#080B12] border border-[#252B38] my-4">
          {qrError ? (
            <div className="text-rose-400 text-xs py-10 text-center">{qrError}</div>
          ) : qrDataUrl ? (
            <div className="p-2.5 bg-white rounded-xl shadow-lg border border-amber-500/30">
              <img
                src={qrDataUrl}
                alt={`Verification QR for ${credential.credentialId}`}
                className="w-48 h-48 block rounded"
              />
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-500 text-xs font-mono">
              Generating QR...
            </div>
          )}

          <div className="mt-3 text-center">
            <span className="font-mono text-xs text-amber-400 font-semibold block">
              {credential.credentialId}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              Scan with any mobile camera to independently audit on Credora
            </span>
          </div>
        </div>

        {/* Credential Metadata Box */}
        <div className="p-3 rounded-xl bg-[#0B0E17] border border-[#252B38] text-xs space-y-1.5 mb-4">
          <div className="font-semibold text-white truncate">{credential.title}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              {credential.institutionId}
            </span>
            {credential.academicYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                AY {credential.academicYear}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-lg btn-secondary-surface text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:border-amber-500/40"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            disabled={!qrDataUrl}
            className="px-3 py-2 rounded-lg btn-secondary-surface text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:border-amber-500/40 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download QR</span>
          </button>
        </div>

        {/* Verify On Blockchain Action */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onVerify) onVerify(credential.credentialId);
          }}
          className="mt-2.5 w-full py-2 rounded-lg btn-gold-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        >
          <ShieldCheck className="w-4 h-4 text-slate-900" />
          <span>Verify on Blockchain Now</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-900" />
        </button>

        {/* Privacy Note */}
        <div className="mt-4 pt-3 border-t border-[#252B38]/80 flex items-center gap-2 text-[10px] text-slate-400 leading-normal">
          <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>
            Privacy Protected: Contains strictly the public Credential ID. Student identity, Aadhaar, marks, and personal data are never embedded.
          </span>
        </div>
      </div>
    </div>
  );
}

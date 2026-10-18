import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  X,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Keyboard,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export function extractCredentialIdFromQr(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();

  // 1. Try URL parameter parsing
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('?')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://credora.internal${trimmed}`);
      const id = url.searchParams.get('verify') || url.searchParams.get('id');
      if (id) return id.trim();
    }
  } catch {
    // Continue fallback
  }

  // 2. Try JSON payload parsing
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.credentialId) return parsed.credentialId.trim();
      if (parsed.id) return parsed.id.trim();
    }
  } catch {
    // Continue fallback
  }

  // 3. Try standard Credora Credential ID regex matching
  const match = trimmed.match(/CRED-[A-Z0-9-]+/i);
  if (match) {
    return match[0].toUpperCase();
  }

  // 4. Fallback to raw string
  return trimmed;
}

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [fileError, setFileError] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerId = 'credora-qr-scanner-box';

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;
    let isStopped = false;

    async function startScanner() {
      setIsInitializing(true);
      setCameraError(null);
      setFileError(null);
      setScannedResult(null);

      try {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        // Try to query cameras
        const cameras = await Html5Qrcode.getCameras();

        if (isStopped) return;

        if (!cameras || cameras.length === 0) {
          throw new Error('No camera found on this device. You can upload an image of the QR code instead.');
        }

        // Start scanning with environment/back camera if possible, or first camera
        const cameraId = cameras[cameras.length - 1].id;

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success handler
            if (isStopped) return;
            const extractedId = extractCredentialIdFromQr(decodedText);
            if (extractedId) {
              setScannedResult(extractedId);
              // Safely stop camera before triggering success
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(() => {}).finally(() => {
                  setTimeout(() => {
                    onScanSuccess(extractedId);
                    onClose();
                  }, 400);
                });
              } else {
                setTimeout(() => {
                  onScanSuccess(extractedId);
                  onClose();
                }, 400);
              }
            }
          },
          () => {
            // Frame miss, normal behavior
          }
        );

        setIsInitializing(false);
      } catch (err) {
        if (!isStopped) {
          setIsInitializing(false);
          setCameraError(
            err.message ||
              'Unable to access camera. Please allow camera permissions, or upload a QR image below.'
          );
        }
      }
    }

    // Delay slightly to ensure DOM container is rendered
    const timer = setTimeout(startScanner, 100);

    return () => {
      isStopped = true;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {}).finally(() => {
              try {
                scannerRef.current.clear();
              } catch {}
            });
          } else {
            scannerRef.current.clear();
          }
        } catch {
          // Ignore scanner cleanup errors
        }
      }
    };
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileError(null);

    try {
      const tempScanner = scannerRef.current || new Html5Qrcode(containerId);
      const decodedText = await tempScanner.scanFile(file, true);
      const extractedId = extractCredentialIdFromQr(decodedText);

      if (extractedId) {
        setScannedResult(extractedId);
        setTimeout(() => {
          onScanSuccess(extractedId);
          onClose();
        }, 400);
      } else {
        setFileError('QR Code detected, but no valid Credential ID was found.');
      }
    } catch (err) {
      setFileError('Could not decode a valid QR code from this image. Please try another file.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md glass-panel p-6 border-[#252B38] bg-[#11151F] text-slate-100 rounded-2xl shadow-[0_0_32px_rgba(245,158,11,0.15)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#171D2B] transition-colors cursor-pointer"
          title="Close Scanner"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Scan Credential QR Code
            </h3>
            <p className="text-[11px] text-slate-400">
              Point your camera at a Credora Academic Passport QR
            </p>
          </div>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="relative overflow-hidden rounded-xl bg-[#080B12] border border-[#252B38] min-h-[260px] flex flex-col items-center justify-center p-3 mb-4">
          {/* Target Scanner Element */}
          <div id={containerId} className="w-full max-w-[260px] overflow-hidden rounded-lg"></div>

          {/* Initializing Spinner */}
          {isInitializing && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080B12]/90 z-20 space-y-2">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Initializing camera feed...</span>
            </div>
          )}

          {/* Success Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080B12]/95 z-30 space-y-2 p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              <span className="text-xs text-emerald-300 font-semibold">QR Code Recognized!</span>
              <span className="font-mono text-xs text-white bg-[#11151F] px-2.5 py-1 rounded border border-[#252B38]">
                {scannedResult}
              </span>
              <span className="text-[10px] text-slate-400">Executing verification audit...</span>
            </div>
          )}

          {/* Camera Error Notice with Manual Entry Fallback */}
          {cameraError && (
            <div className="p-4 text-center space-y-3 max-w-sm">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Camera Feed Unavailable
                </span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {cameraError}
                </p>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-lg btn-secondary-surface text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:border-amber-500/40"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload QR Image File</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 rounded-lg bg-[#11151F] hover:bg-[#171D2B] border border-[#252B38] text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Use Manual Identifier Entry</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Alternative & Status */}
        {fileError && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Bottom Helper Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#252B38]/80 text-xs">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile}
            className="text-amber-400 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isProcessingFile ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reading QR image...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload QR Image File</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
}

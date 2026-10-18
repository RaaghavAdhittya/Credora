import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  Lock,
  Award,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Blocks,
  FileCheck2,
  Scroll,
  QrCode,
} from 'lucide-react';
import { getStudentTimelineApi } from '../services/api';
import { getEtherscanTxUrl, CONTRACT_ADDRESS, getEtherscanAddressUrl } from '../constants/contract';
import CredentialQrModal from './CredentialQrModal';

const RECORD_TYPE_CONFIG = {
  BOARD_RESULT_10: { label: 'Class 10 Board Result', short: 'Class X', icon: Award, level: 1 },
  BOARD_RESULT_12: { label: 'Class 12 Board Result', short: 'Class XII', icon: Award, level: 2 },
  DIPLOMA: { label: 'Diploma', short: 'Diploma', icon: FileCheck2, level: 3 },
  UG_DEGREE: { label: 'Undergraduate Degree', short: 'UG Degree', icon: GraduationCap, level: 4 },
  PG_DEGREE: { label: 'Postgraduate Degree', short: 'PG Degree', icon: GraduationCap, level: 5 },
  TRANSCRIPT: { label: 'Academic Transcript', short: 'Transcript', icon: Scroll, level: 3 },
  CERTIFICATE: { label: 'Certificate', short: 'Certificate', icon: FileText, level: 2 },
  PHD_MILESTONE: { label: 'PhD Milestone', short: 'Doctorate', icon: Sparkles, level: 6 },
};

export default function StudentPassportPortal({ onVerifyCredential }) {
  const [studentInput, setStudentInput] = useState('DEMO-STUDENT-001');
  const [loading, setLoading] = useState(false);
  const [passportData, setPassportData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedRecordIds, setExpandedRecordIds] = useState(new Set());
  const [qrModalCredential, setQrModalCredential] = useState(null);

  // Auto-fetch demo student on initial load for immediate interactive demonstration
  useEffect(() => {
    handleFetchPassport(null, 'DEMO-STUDENT-001');
  }, []);

  const handleFetchPassport = async (e, overrideId) => {
    if (e) e.preventDefault();
    const cleanId = (overrideId || studentInput).trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getStudentTimelineApi(cleanId);
      if (response && response.status === 'success') {
        setPassportData(response.data);
      } else {
        throw new Error(response.message || 'Unable to retrieve academic passport.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student academic passport.');
      setPassportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleExpand = (credentialId) => {
    setExpandedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(credentialId)) {
        next.delete(credentialId);
      } else {
        next.add(credentialId);
      }
      return next;
    });
  };

  const timelineRecords = passportData?.timeline || [];

  // Sort chronologically (earliest to latest for an intuitive lifelong educational journey)
  const sortedRecords = [...timelineRecords].sort((a, b) => {
    const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
    const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
    if (dateA !== dateB) return dateA - dateB;
    return (a.academicYear || '').localeCompare(b.academicYear || '');
  });

  const filteredRecords = sortedRecords.filter((rec) => {
    if (selectedCategory === 'ALL') return true;
    return rec.recordType === selectedCategory;
  });

  // Deduce latest / current qualification from highest academic milestone or most recent issuance
  const getLatestQualification = (records) => {
    if (!records || records.length === 0) return 'No qualifications recorded';
    const validRecords = records.filter((r) => r.status === 'ISSUED');
    const pool = validRecords.length > 0 ? validRecords : records;

    const ranked = [...pool].sort((a, b) => {
      const levelA = RECORD_TYPE_CONFIG[a.recordType]?.level || 0;
      const levelB = RECORD_TYPE_CONFIG[b.recordType]?.level || 0;
      if (levelB !== levelA) return levelB - levelA;
      return new Date(b.issueDate || b.createdAt || 0) - new Date(a.issueDate || a.createdAt || 0);
    });

    return ranked[0]?.title || ranked[0]?.recordType || 'Academic Record';
  };

  const latestQualification = getLatestQualification(timelineRecords);
  const totalVerifiedCount = timelineRecords.filter((r) => r.status === 'ISSUED').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Lookup Bar / Passport Search Bar */}
      <div className="glass-panel p-4 sm:p-5 border-[#252B38] bg-[#11151F]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              Academic Identity Lookup
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Enter a 12-digit APAAR ID or institutional student identifier to unlock the lifelong academic journey.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStudentInput('DEMO-STUDENT-001');
              setError(null);
              handleFetchPassport(null, 'DEMO-STUDENT-001');
            }}
            className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium self-start sm:self-auto cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Student</span>
          </button>
        </div>

        <form onSubmit={handleFetchPassport} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="student-apaar-input"
              type="text"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder="Enter 12-digit APAAR ID (e.g. 123456789012) or student identifier"
              className="w-full pl-9 pr-3 py-2 glass-input text-slate-100 placeholder-slate-500 font-mono text-xs focus:border-amber-400"
            />
          </div>

          <button
            id="btn-fetch-passport"
            type="submit"
            disabled={loading || !studentInput.trim()}
            className="px-5 py-2 rounded-lg btn-gold-primary text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Querying Ledger...</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                <span>Access Passport</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-3 pt-2.5 border-t border-[#252B38]/80 flex items-center gap-2 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>
            Zero-PII Sovereign Guarantee: Raw APAAR identifiers and internal identity references are never displayed or broadcast on Ethereum.
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Record Query Failed:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Academic Passport View */}
      {passportData && (
        <div className="space-y-6">
          {/* 1. PASSPORT HEADER */}
          <div className="relative overflow-hidden glass-panel p-5 sm:p-7 border-[#252B38] bg-gradient-to-b from-[#11151F]/95 via-[#0F1422]/90 to-[#080B12]/95 rounded-2xl shadow-[0_0_24px_rgba(245,158,11,0.06)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#252B38]/80">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="font-semibold tracking-wide uppercase text-[11px]">
                    APAAR-Linked Sovereign Identity
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[11px]">Protected Profile</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  <span>Academic Passport</span>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    Verified
                  </span>
                </h1>

                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Decentralized lifelong record of accredited educational achievements, degrees, board certifications, and transcripts anchored to Ethereum Sepolia.
                </p>
              </div>

              {/* Passport Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-stretch md:self-auto shrink-0">
                <div className="p-3 bg-[#0B0E17]/90 border border-[#252B38] rounded-xl text-center flex flex-col justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono leading-none">
                    {passportData.totalRecords}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                    Total Records
                  </span>
                </div>

                <div className="p-3 bg-[#0B0E17]/90 border border-[#252B38] rounded-xl text-center flex flex-col justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono leading-none">
                    {totalVerifiedCount}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                    Confirmed
                  </span>
                </div>

                <div className="p-3 bg-[#0B0E17]/90 border border-[#252B38] rounded-xl text-center col-span-2 sm:col-span-1 flex flex-col justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono leading-none">
                    {passportData.institutionsAttended?.length || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                    Institutions
                  </span>
                </div>
              </div>
            </div>

            {/* Passport Detail Bar: Latest Qualification & Institutions Attended */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0B0E17]/70 border border-[#252B38]/80">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
                    Latest / Current Qualification
                  </span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">
                    {latestQualification}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0B0E17]/70 border border-[#252B38]/80">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-medium mb-1">
                    Accredited Institutions Attended
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {passportData.institutionsAttended && passportData.institutionsAttended.length > 0 ? (
                      passportData.institutionsAttended.map((inst, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#11151F] border border-[#252B38] text-[11px] font-mono text-slate-200"
                        >
                          <span className="font-semibold">{inst.institutionId}</span>
                          <span className="text-amber-400 text-[10px]">
                            ({inst.credentialsCount})
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None recorded.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. LIGHTWEIGHT RECORD-TYPE FILTERS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'ALL'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-[#11151F] border border-[#252B38]'
                }`}
              >
                All Milestones ({timelineRecords.length})
              </button>

              {Object.keys(RECORD_TYPE_CONFIG).map((typeKey) => {
                const count = timelineRecords.filter((r) => r.recordType === typeKey).length;
                if (count === 0) return null;
                const config = RECORD_TYPE_CONFIG[typeKey];
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setSelectedCategory(typeKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedCategory === typeKey
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 bg-[#11151F] border border-[#252B38]'
                    }`}
                  >
                    {config.short || config.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Chronological Journey ({filteredRecords.length})</span>
            </div>
          </div>

          {/* 2. LIFELONG VERTICAL ACADEMIC TIMELINE */}
          {filteredRecords.length === 0 ? (
            <div className="glass-panel p-10 text-center text-slate-400 text-xs border-[#252B38]">
              <GraduationCap className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">No Records in Selected Category</p>
              <p className="text-slate-500 mt-1">Select "All Milestones" to view the full academic journey.</p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-[#252B38] before:to-slate-800">
              {filteredRecords.map((record, index) => {
                const config = RECORD_TYPE_CONFIG[record.recordType] || {
                  label: record.recordType || 'Academic Record',
                  short: record.recordType || 'Record',
                  icon: BookOpen,
                };
                const IconComponent = config.icon;
                const isIssued = record.status === 'ISSUED';
                const isRevoked = record.status === 'REVOKED';
                const isExpanded = expandedRecordIds.has(record.credentialId);

                return (
                  <div key={record.credentialId || index} className="relative group">
                    {/* Vertical Timeline Node Marker */}
                    <div className="absolute -left-[27px] sm:-left-[35px] top-4 w-7 h-7 rounded-full bg-[#080B12] border-2 border-amber-400 flex items-center justify-center text-amber-400 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all z-10">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    {/* Timeline Milestone Card */}
                    <div className="glass-panel p-5 border-[#252B38] bg-[#11151F]/85 hover:border-amber-500/30 transition-all rounded-xl shadow-[0_0_16px_rgba(0,0,0,0.2)]">
                      {/* Milestone Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#252B38]/70">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#0B0E17] border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
                            {config.label}
                          </span>

                          {record.academicYear && (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-300">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>AY {record.academicYear}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {/* Status Badge */}
                          {isIssued ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                              <ShieldCheck className="w-3 h-3" />
                              VERIFIED
                            </span>
                          ) : isRevoked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-rose-950/60 text-rose-400 border border-rose-800">
                              <ShieldAlert className="w-3 h-3" />
                              REVOKED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-[#171D2B] text-slate-300 border border-[#252B38]">
                              <Clock className="w-3 h-3" />
                              {record.status}
                            </span>
                          )}

                          {/* Concise Blockchain Verification Indicator */}
                          <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B0E17] border border-[#252B38] text-[10px] font-mono text-slate-400">
                            <Blocks className="w-3 h-3 text-amber-400" />
                            <span>Sepolia Anchored</span>
                          </div>
                        </div>
                      </div>

                      {/* Milestone Title & Institutional Context */}
                      <div className="pt-3.5 space-y-2">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {record.title || config.label}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                            <span className="text-slate-400 font-sans">Issuer:</span>
                            <span className="font-semibold text-slate-200">{record.institutionId}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-400 font-sans">Issued:</span>
                            <span>{record.issueDate || '—'}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-sans">ID:</span>
                            <span className="text-slate-300 font-semibold truncate" title={record.credentialId}>
                              {record.credentialId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(record.credentialId, `cid-${index}`)}
                              className="p-0.5 text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
                              title="Copy Credential ID"
                            >
                              {copiedKey === `cid-${index}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4. EXPANDABLE CREDENTIAL DETAILS (Returned API Fields Only) */}
                      {isExpanded && (
                        <div className="mt-4 pt-3.5 border-t border-[#252B38] space-y-2.5 text-xs bg-[#0B0E17]/60 -mx-5 -mb-5 p-5 rounded-b-xl">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold block">
                            Cryptographic Proof & Metadata Attributes
                          </span>

                          <div className="space-y-1.5 font-mono text-[11px]">
                            {/* Credential Commitment Hash */}
                            {record.credentialHash && (
                              <div className="p-2 rounded bg-[#11151F] border border-[#252B38] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-slate-400 text-[10px] uppercase w-44 shrink-0">
                                  Keccak-256 Digest:
                                </span>
                                <span className="truncate text-slate-200 select-all font-mono">
                                  {record.credentialHash}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(record.credentialHash, `hash-${index}`)}
                                  className="text-slate-500 hover:text-amber-400 p-0.5 cursor-pointer shrink-0 self-end sm:self-auto"
                                  title="Copy Digest"
                                >
                                  {copiedKey === `hash-${index}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Document Hash (if returned) */}
                            {record.documentHash && (
                              <div className="p-2 rounded bg-[#11151F] border border-[#252B38] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-slate-400 text-[10px] uppercase w-44 shrink-0">
                                  Document Hash:
                                </span>
                                <span className="truncate text-slate-200 select-all font-mono">
                                  {record.documentHash}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(record.documentHash, `doc-${index}`)}
                                  className="text-slate-500 hover:text-amber-400 p-0.5 cursor-pointer shrink-0 self-end sm:self-auto"
                                  title="Copy Document Hash"
                                >
                                  {copiedKey === `doc-${index}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Transaction Hash & Etherscan Link (if returned) */}
                            {record.transactionHash && (
                              <div className="p-2 rounded bg-[#11151F] border border-[#252B38] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-slate-400 text-[10px] uppercase w-44 shrink-0">
                                  Sepolia Tx Hash:
                                </span>
                                <a
                                  href={getEtherscanTxUrl(record.transactionHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-mono"
                                  title={record.transactionHash}
                                >
                                  <span>{record.transactionHash}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(record.transactionHash, `tx-${index}`)}
                                  className="text-slate-500 hover:text-amber-400 p-0.5 cursor-pointer shrink-0 self-end sm:self-auto"
                                  title="Copy Tx Hash"
                                >
                                  {copiedKey === `tx-${index}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Payload Details (program / gpa) */}
                            {record.payload && (
                              <div className="p-2.5 rounded bg-[#11151F] border border-[#252B38] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {record.payload.program && (
                                  <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Program / Branch:</span>
                                    <span className="text-slate-200 font-sans font-medium">{record.payload.program}</span>
                                  </div>
                                )}
                                {record.payload.gpa && (
                                  <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">GPA / Performance:</span>
                                    <span className="text-amber-300 font-semibold">{record.payload.gpa}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Milestone Footer / Actions */}
                      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#252B38]/60">
                        {/* Actions: Verify on Blockchain & Show QR */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onVerifyCredential && onVerifyCredential(record.credentialId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-secondary-surface text-slate-200 hover:text-amber-300 border border-[#252B38] hover:border-amber-500/40 text-xs font-medium cursor-pointer transition-all shadow-[0_0_8px_rgba(245,158,11,0.08)]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Verify on Blockchain</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setQrModalCredential(record)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-secondary-surface text-slate-200 hover:text-amber-300 border border-[#252B38] hover:border-amber-500/40 text-xs font-medium cursor-pointer transition-all"
                            title="Show QR Code for Mobile Verification"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-400" />
                            <span>Show QR</span>
                          </button>
                        </div>

                        {/* Details Expand Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(record.credentialId)}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-medium cursor-pointer transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Cryptographic Details'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QR Code Verification Modal */}
      {qrModalCredential && (
        <CredentialQrModal
          credential={qrModalCredential}
          onClose={() => setQrModalCredential(null)}
          onVerify={(cid) => {
            setQrModalCredential(null);
            if (onVerifyCredential) onVerifyCredential(cid);
          }}
        />
      )}
    </div>
  );
}




'use client';

import { Case, DISCLAIMER_LEGAL_EVIDENCE, DISCLAIMER_ADVISORY_VOCAL_METRICS } from '@/types';
import { isSyntheticCase } from '@/lib/data/store';
import { Printer, Download, X, Shield, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: Case | null;
  currentOfficer?: {
    id?: string;
    name?: string;
    badgeNumber?: string;
  };
  officerId?: string;
  officerName?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  caseData,
  currentOfficer,
  officerId,
  officerName,
}: ReportModalProps) {
  if (!isOpen || !caseData) return null;

  const isDemo =
    isSyntheticCase(caseData) ||
    caseData.isSyntheticDemo === true ||
    caseData.latestRun?.isSyntheticDemo === true;

  const verifiedEntities = (caseData.entities || []).filter(
    (e) =>
      e.verificationStatus === 'verified' ||
      e.verificationStatus === 'confirmed' ||
      e.verificationStatus === 'corrected' ||
      e.status === 'verified'
  );
  const verifiedEntitiesCount = verifiedEntities.length;

  const confirmedTriggers = (caseData.triggers || []).filter(
    (t) =>
      t.verificationStatus === 'confirmed' ||
      t.verificationStatus === 'verified' ||
      t.verificationStatus === 'corrected' ||
      t.status === 'confirmed'
  );
  const confirmedTriggersCount = confirmedTriggers.length;

  const auditOfficer =
    officerName ||
    currentOfficer?.name ||
    caseData.officerName ||
    caseData.assignedOfficerName ||
    caseData.investigatingOfficer ||
    'Attending Officer';

  const badgeToken =
    currentOfficer?.badgeNumber ||
    officerId ||
    caseData.officerId ||
    'Badge On File';

  const audioDurationStr = caseData.audioMetadata?.durationSeconds
    ? `${Math.floor(caseData.audioMetadata.durationSeconds / 60)}:${Math.floor(caseData.audioMetadata.durationSeconds % 60).toString().padStart(2, '0')}`
    : caseData.audioDuration || (caseData.audioMetadata?.purged ? 'Purged' : 'N/A');

  const audioFormatStr =
    caseData.audioMetadata?.format ||
    caseData.audioMetadata?.mimeType ||
    caseData.audioFormat ||
    (caseData.audioMetadata?.purged ? 'Purged' : 'N/A');

  const audioHashStr =
    caseData.audioMetadata?.sha256Hash ||
    caseData.chainOfCustodyHash ||
    (caseData.audioMetadata?.purged ? 'PURGED (Audit Hash Recorded)' : 'N/A');

  const hasRealEmotion = Boolean(
    caseData.emotionProfile &&
      (caseData.emotionProfile.primaryEmotion ||
        (caseData.emotionProfile.emotions && Object.keys(caseData.emotionProfile.emotions).length > 0))
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const sanitize = (text: string | number | undefined | null) => {
      if (text === undefined || text === null) return '""';
      let str = String(text).replace(/"/g, '""');
      if (/^\s*[=+\-@\t\r%|]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const rows: string[] = [];
    rows.push(['Report Type', 'VECNAVERSE Cybercrime Triage & Forensic Dossier'].map(sanitize).join(','));
    rows.push(['Case ID', caseData.id].map(sanitize).join(','));
    rows.push(['Docket Number', caseData.docketNumber || `#${caseData.id}`].map(sanitize).join(','));
    rows.push(['Incident Title', caseData.title].map(sanitize).join(','));
    rows.push(['Status', caseData.status].map(sanitize).join(','));

    if (caseData.callerCategory) {
      rows.push(['Caller Category', caseData.callerCategory.replace(/_/g, ' ')].map(sanitize).join(','));
    }
    if (caseData.callerName) {
      rows.push(['Caller Name', caseData.callerName].map(sanitize).join(','));
    }
    if (caseData.callerPhone) {
      rows.push(['Caller Phone', caseData.callerPhone].map(sanitize).join(','));
    }

    rows.push(['Audio Duration', audioDurationStr].map(sanitize).join(','));
    rows.push(['Audio Format', audioFormatStr].map(sanitize).join(','));
    rows.push(['Audio SHA256 Hash', audioHashStr].map(sanitize).join(','));

    if (caseData.urgencyScore !== undefined) {
      rows.push(['Triage Urgency Score', `${caseData.urgencyScore}/100`].map(sanitize).join(','));
    }
    if (caseData.urgencyLevel) {
      rows.push(['Urgency Level', caseData.urgencyLevel].map(sanitize).join(','));
    }

    rows.push(['Verified Entities Count', String(verifiedEntitiesCount)].map(sanitize).join(','));
    rows.push(['Confirmed Triggers Count', String(confirmedTriggersCount)].map(sanitize).join(','));
    rows.push(['Audit Officer', auditOfficer].map(sanitize).join(','));
    rows.push([
      'Statutory Disclaimer',
      'VECNAVERSE is an investigative assistance platform. Speech emotion indicators and AI-extracted triggers are advisory and require officer verification.',
    ].map(sanitize).join(','));

    if (isDemo) {
      rows.push(['Dataset Provenance', 'DEMO FIXTURE / EVALUATION DATA'].map(sanitize).join(','));
    }

    if (hasRealEmotion && caseData.emotionProfile) {
      if (caseData.emotionProfile.primaryEmotion) {
        rows.push(['Primary Emotion', caseData.emotionProfile.primaryEmotion].map(sanitize).join(','));
      }
      if (caseData.emotionProfile.emotions) {
        const em = caseData.emotionProfile.emotions;
        if (typeof em.fear === 'number') rows.push(['Fear Metric', `${Math.round(em.fear * 100)}%`].map(sanitize).join(','));
        if (typeof em.distress === 'number') rows.push(['Distress Metric', `${Math.round(em.distress * 100)}%`].map(sanitize).join(','));
        if (typeof em.anger === 'number') rows.push(['Anger Metric', `${Math.round(em.anger * 100)}%`].map(sanitize).join(','));
        if (typeof em.nervousness === 'number') rows.push(['Nervousness Metric', `${Math.round(em.nervousness * 100)}%`].map(sanitize).join(','));
        if (typeof em.calm === 'number') rows.push(['Calm Metric', `${Math.round(em.calm * 100)}%`].map(sanitize).join(','));
      }
    }

    rows.push(['Classification', caseData.classificationStandard || 'Law Enforcement Sensitive'].map(sanitize).join(','));
    rows.push(['Generated At', new Date().toISOString()].map(sanitize).join(','));
    rows.push('');

    // Entities (only if real entities exist)
    if (caseData.entities && caseData.entities.length > 0) {
      rows.push(['--- EXTRACTED & VERIFIED ENTITIES ---'].map(sanitize).join(','));
      rows.push(['Type', 'Spoken Form', 'Normalized / Detail', 'Confidence', 'Verification Status'].map(sanitize).join(','));
      caseData.entities.forEach((ent) => {
        rows.push([
          ent.type,
          ent.value || ent.text || '',
          ent.normalizedValue || ent.detail || '',
          ent.confidence !== undefined ? `${ent.confidence}%` : 'N/A',
          ent.verificationStatus || ent.status || 'unverified',
        ].map(sanitize).join(','));
      });
      rows.push('');
    }

    // Emergency Triggers (only if real triggers exist)
    if (caseData.triggers && caseData.triggers.length > 0) {
      rows.push(['--- EMERGENCY & THREAT TRIGGERS ---'].map(sanitize).join(','));
      rows.push(['Category', 'Severity', 'Quote', 'Time Offset', 'Confidence', 'Context', 'Status'].map(sanitize).join(','));
      caseData.triggers.forEach((trig) => {
        const timeOffsetStr =
          trig.timeOffset ||
          (trig.timestamp !== undefined
            ? `${Math.floor(trig.timestamp / 60)}:${Math.floor(trig.timestamp % 60).toString().padStart(2, '0')}`
            : '00:00');
        rows.push([
          trig.category || trig.type || '',
          trig.severity,
          trig.quote,
          timeOffsetStr,
          trig.confidence !== undefined ? `${trig.confidence}%` : 'N/A',
          trig.context || trig.contextTag || 'direct',
          trig.verificationStatus || trig.status || 'pending',
        ].map(sanitize).join(','));
      });
      rows.push('');
    }

    // Synchronized Transcript (only if real segments exist)
    if (caseData.segments && caseData.segments.length > 0) {
      rows.push(['--- SYNCHRONIZED FORENSIC TRANSCRIPT EXCERPT ---'].map(sanitize).join(','));
      rows.push(['Speaker', 'Time Offset', 'Transcript Content', 'Confidence'].map(sanitize).join(','));
      caseData.segments.forEach((seg) => {
        const speakerName =
          typeof seg.speaker === 'string'
            ? seg.speaker
            : seg.speaker?.provisionalLabel || seg.speaker?.speakerId || 'Speaker';
        const timeStr =
          seg.startTime !== undefined
            ? `${Math.floor(seg.startTime / 60)}:${Math.floor(seg.startTime % 60).toString().padStart(2, '0')}`
            : '';
        rows.push([
          speakerName,
          timeStr,
          seg.editedText || seg.text || '',
          seg.confidence !== undefined ? `${seg.confidence}%` : 'N/A',
        ].map(sanitize).join(','));
      });
      rows.push('');
    }

    // Advisory Vocal Indicators (only if real indicators exist)
    if (caseData.vocalIndicators && caseData.vocalIndicators.length > 0) {
      rows.push(['--- ADVISORY VOCAL INDICATORS (NON-EVIDENTIARY) ---'].map(sanitize).join(','));
      rows.push(['Indicator Type', 'Score', 'Variance Level', 'Description', 'Disclaimer'].map(sanitize).join(','));
      caseData.vocalIndicators.forEach((voc) => {
        rows.push([
          voc.title || voc.metricName || voc.type,
          voc.score ?? voc.value ?? '',
          voc.variance || voc.trend || '',
          voc.description,
          DISCLAIMER_ADVISORY_VOCAL_METRICS,
        ].map(sanitize).join(','));
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const safeDocket = (caseData.docketNumber || caseData.id).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `case-${safeDocket}-dossier.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(
      {
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          docketNumber: caseData.docketNumber || `#${caseData.id}`,
          incidentTitle: caseData.title,
          status: caseData.status,
          callerCategory: caseData.callerCategory,
          callerName: caseData.callerName,
          callerPhone: caseData.callerPhone,
          urgencyScore: caseData.urgencyScore,
          audioMetadata: {
            duration: audioDurationStr,
            format: audioFormatStr,
            sha256Hash: audioHashStr,
          },
          verifiedEntitiesCount,
          confirmedTriggersCount,
          auditOfficer,
          isSyntheticDemo: isDemo,
          disclaimer:
            'VECNAVERSE is an investigative assistance platform. Speech emotion indicators and AI-extracted triggers are advisory and require officer verification.',
        },
        case: caseData,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const safeDocket = (caseData.docketNumber || caseData.id).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const link = document.createElement('a');
    link.href = url;
    link.download = `case-${safeDocket}-dossier.json`;
    link.click();
    document.body.appendChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-[#35373e] bg-[#1c1d21] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#35373e] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#23252a] text-[#8a9a5b] border border-[#35373e]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#8a9a5b]">
                  {caseData.docketNumber || `#${caseData.id}`}
                </span>
                <span className="rounded bg-[#23252a] px-2 py-0.5 text-[10px] font-medium text-[#9e9c96] border border-[#35373e]">
                  INVESTIGATION DOSSIER
                </span>
                {isDemo && (
                  <span className="rounded bg-[#ffb964]/20 px-2 py-0.5 text-[10px] font-bold text-[#ffb964] border border-[#ffb964]/50 font-mono tracking-wider">
                    DEMO FIXTURE / EVALUATION DATA
                  </span>
                )}
              </div>
              <h2 className="text-base font-semibold text-[#edeae1]">{caseData.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
              title="Print / Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
              title="Download CSV Export"
            >
              <Download className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Download CSV Export</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
              title="Export JSON"
            >
              <Download className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1.5 text-[#9e9c96] hover:bg-[#23252a] hover:text-[#edeae1] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-[#edeae1]" id="printable-dossier">
          {/* Official Enclave Banner */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded border border-[#35373e] bg-[#18191c] p-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#8a9a5b]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#edeae1]">
                  VECNAVERSE AUDIO INTELLIGENCE ENCLAVE
                </span>
              </div>
              <p className="mt-1 text-xs text-[#9e9c96]">
                Investigating Agency: {caseData.taskForce || 'Cyber Financial Crimes Task Force'}
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono font-medium text-[#8a9a5b]">
                {caseData.classificationStandard || 'FedRAMP High / CJIS Tier 4'}
              </div>
              <div className="text-[#9e9c96]">Audit Officer: {auditOfficer}</div>
              <div className="text-[#71706b]">Generated: {new Date().toLocaleString()}</div>
            </div>
          </div>

          {/* Demo Fixture Badge Banner */}
          {isDemo && (
            <div className="mb-4 rounded border border-[#ffb964]/50 bg-[#ffb964]/10 p-2.5 text-xs text-[#ffb964] flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className="font-bold tracking-wider">DEMO FIXTURE / EVALUATION DATA</span>
              <span className="text-[11px] text-[#ffb964]/80">
                Simulated Evaluation Fixture — Non-Evidentiary Demonstration Material
              </span>
            </div>
          )}

          {/* Legal / Non-Evidentiary Disclaimer */}
          <div className="mb-6 rounded border border-[#b87a28]/40 bg-[#b87a28]/10 p-3.5 text-xs text-[#ffb964] flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#ffb964] mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold tracking-wide block">LEGAL & ETHICAL NOTICE:</span>
              <p className="font-semibold leading-relaxed">
                VECNAVERSE is an investigative assistance platform. Speech emotion indicators and AI-extracted triggers are advisory and require officer verification.
              </p>
              <p className="text-[11px] text-[#ffb964]/80 leading-relaxed">
                {DISCLAIMER_LEGAL_EVIDENCE} {DISCLAIMER_ADVISORY_VOCAL_METRICS}
              </p>
            </div>
          </div>

          {/* 1. Case & Audio Evidence Metadata */}
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
              1. Case & Audio Evidence Metadata
            </h3>
            <div className="grid grid-cols-2 gap-2 rounded border border-[#35373e] bg-[#18191c] p-3 text-xs md:grid-cols-3">
              <div>
                <span className="text-[#9e9c96]">Docket Number:</span>
                <p className="font-mono font-semibold text-[#edeae1]">{caseData.docketNumber || `#${caseData.id}`}</p>
              </div>
              <div>
                <span className="text-[#9e9c96]">Incident Title:</span>
                <p className="font-semibold text-[#edeae1] truncate">{caseData.title}</p>
              </div>
              <div>
                <span className="text-[#9e9c96]">Status:</span>
                <p className="font-medium text-[#8a9a5b]">{caseData.status}</p>
              </div>
              <div>
                <span className="text-[#9e9c96]">Audio Duration:</span>
                <p className="font-mono text-[#edeae1]">{audioDurationStr}</p>
              </div>
              <div>
                <span className="text-[#9e9c96]">Audio Format:</span>
                <p className="font-mono text-[#edeae1]">{audioFormatStr}</p>
              </div>
              <div>
                <span className="text-[#9e9c96]">SHA-256 Hash:</span>
                <p className="font-mono text-[10px] text-[#edeae1] truncate" title={audioHashStr}>
                  {audioHashStr}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Caller Information */}
          <div className="mb-6 rounded border border-[#35373e] bg-[#18191c] p-3 text-xs">
            <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#d96f68]">
              2. Caller Information & Speech Emotion Recognition (SER) Telemetry
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
              <div className="p-2 rounded bg-[#121315] border border-[#35373e]">
                <span className="text-[10px] text-[#71706b] uppercase font-mono block">Caller Name</span>
                <span className="font-mono font-bold text-[#edeae1]">
                  {caseData.callerName || 'Not Recorded'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#121315] border border-[#35373e]">
                <span className="text-[10px] text-[#71706b] uppercase font-mono block">Caller Phone</span>
                <span className="font-mono text-[#8a9a5b]">
                  {caseData.callerPhone || 'Unlisted'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#121315] border border-[#35373e]">
                <span className="text-[10px] text-[#71706b] uppercase font-mono block">Caller Category</span>
                <span className="font-mono font-bold text-[#edeae1] uppercase">
                  {caseData.callerCategory ? caseData.callerCategory.replace(/_/g, ' ') : 'NOT SPECIFIED'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#121315] border border-[#35373e]">
                <span className="text-[10px] text-[#71706b] uppercase font-mono block">Urgency Score</span>
                <span className="font-mono font-bold text-[#d96f68]">
                  {caseData.urgencyScore !== undefined ? `${caseData.urgencyScore}/100` : 'Not Assessed'}
                  {caseData.urgencyLevel ? ` [${caseData.urgencyLevel}]` : ''}
                </span>
              </div>
            </div>

            {hasRealEmotion && caseData.emotionProfile && (
              <div className="space-y-1.5 pt-2 border-t border-[#35373e]/50 font-mono text-[11px]">
                {caseData.emotionProfile.primaryEmotion && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#9e9c96]">Primary Detected Emotion:</span>
                    <span className="font-bold text-[#edeae1] uppercase">{caseData.emotionProfile.primaryEmotion}</span>
                  </div>
                )}
                {caseData.emotionProfile.emotions && (
                  <>
                    {typeof caseData.emotionProfile.emotions.fear === 'number' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#d96f68]">Fear / Panic:</span>
                        <span className="font-bold">{Math.round(caseData.emotionProfile.emotions.fear * 100)}%</span>
                      </div>
                    )}
                    {typeof caseData.emotionProfile.emotions.distress === 'number' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#ffb964]">Physiological Distress:</span>
                        <span className="font-bold">{Math.round(caseData.emotionProfile.emotions.distress * 100)}%</span>
                      </div>
                    )}
                    {typeof caseData.emotionProfile.emotions.anger === 'number' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#e06c75]">Agitation / Anger:</span>
                        <span className="font-bold">{Math.round(caseData.emotionProfile.emotions.anger * 100)}%</span>
                      </div>
                    )}
                    {typeof caseData.emotionProfile.emotions.calm === 'number' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#8a9a5b]">Baseline Calm:</span>
                        <span className="font-bold">{Math.round(caseData.emotionProfile.emotions.calm * 100)}%</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 3. Confirmed & Flagged Emergency Triggers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#b84a44]">
                3. Confirmed & Flagged Emergency Triggers
              </h3>
              <span className="rounded bg-[#5a8264]/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#7ea886] border border-[#5a8264]/40">
                {confirmedTriggersCount} Confirmed / {caseData.triggers?.length || 0} Total
              </span>
            </div>
            {caseData.triggers.length === 0 ? (
              <p className="text-xs text-[#9e9c96] italic">No high-risk emergency triggers detected in analyzed audio.</p>
            ) : (
              <div className="space-y-2">
                {caseData.triggers.map((trig) => {
                  const isConfirmed =
                    trig.verificationStatus === 'confirmed' ||
                    trig.verificationStatus === 'verified' ||
                    trig.verificationStatus === 'corrected' ||
                    trig.status === 'confirmed';
                  return (
                    <div
                      key={trig.id}
                      className={`rounded border p-3 text-xs ${
                        isConfirmed
                          ? 'border-[#5a8264]/50 bg-[#1e2a22]/30'
                          : 'border-[#b84a44]/40 bg-[#401311]/20'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-mono font-bold text-[#d96f68]">
                          {trig.title || trig.category || trig.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#401311] px-1.5 py-0.5 font-mono text-[10px] text-[#d96f68] border border-[#b84a44]/40">
                            {trig.severity.toUpperCase()}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                              isConfirmed
                                ? 'bg-[#5a8264]/20 text-[#7ea886] border border-[#5a8264]/40'
                                : 'bg-[#b87a28]/20 text-[#ffb964] border border-[#b87a28]/40'
                            }`}
                          >
                            {isConfirmed ? 'CONFIRMED' : 'PENDING REVIEW'}
                          </span>
                        </div>
                      </div>
                      <p className="font-serif italic text-[#edeae1] my-1">"{trig.quote}"</p>
                      <div className="flex items-center justify-between text-[11px] text-[#9e9c96] pt-1 border-t border-[#35373e]/50">
                        <span>Offset: {trig.timeOffset || `${trig.timestamp}s`}</span>
                        <span>Confidence: {trig.confidence}%</span>
                        <span className="font-medium text-[#8a9a5b]">
                          Officer Status: {trig.verificationStatus || trig.status || 'unverified'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Verified & Extracted Entities */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
                4. Verified & Extracted Entities
              </h3>
              <span className="rounded bg-[#5a8264]/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#7ea886] border border-[#5a8264]/40">
                {verifiedEntitiesCount} Verified / {caseData.entities?.length || 0} Total
              </span>
            </div>
            <div className="overflow-x-auto rounded border border-[#35373e]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18191c] text-[#9e9c96] border-b border-[#35373e]">
                  <tr>
                    <th className="p-2">Type</th>
                    <th className="p-2">Spoken Entity</th>
                    <th className="p-2">Forensic Detail / Normalization</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35373e] bg-[#23252a]">
                  {(caseData.entities || []).map((ent) => {
                    const isVerified =
                      ent.verificationStatus === 'verified' ||
                      ent.verificationStatus === 'confirmed' ||
                      ent.verificationStatus === 'corrected' ||
                      ent.status === 'verified';
                    return (
                      <tr key={ent.id} className="hover:bg-[#2d2f36]/40">
                        <td className="p-2 font-mono text-[#8a9a5b]">{ent.type}</td>
                        <td className="p-2 font-semibold text-[#edeae1]">{ent.value || ent.text}</td>
                        <td className="p-2 text-[#9e9c96]">{ent.normalizedValue || ent.detail || '—'}</td>
                        <td className="p-2 font-mono">{ent.confidence}%</td>
                        <td className="p-2 text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              isVerified
                                ? 'bg-[#5a8264]/20 text-[#7ea886] border border-[#5a8264]/40'
                                : 'bg-[#23252a] text-[#9e9c96] border border-[#35373e]'
                            }`}
                          >
                            {isVerified && <CheckCircle2 className="h-3 w-3" />}
                            {ent.verificationStatus || ent.status || 'unverified'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Synchronized Forensic Transcript Excerpt */}
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
              5. Synchronized Forensic Transcript Excerpt
            </h3>
            <div className="space-y-2 rounded border border-[#35373e] bg-[#18191c] p-3 max-h-80 overflow-y-auto">
              {(caseData.segments || []).map((seg) => (
                <div key={seg.id} className="rounded bg-[#23252a] p-2.5 text-xs border border-[#35373e]">
                  <div className="flex items-center justify-between text-[#9e9c96] font-mono text-[11px] mb-1">
                    <span className="font-semibold text-[#edeae1]">
                      {typeof seg.speaker === 'string'
                        ? seg.speaker
                        : seg.speaker?.provisionalLabel ||
                          seg.speaker?.speakerId ||
                          seg.speakerLabel ||
                          seg.speakerId ||
                          'Speaker'}
                    </span>
                    <span>
                      {seg.startTime !== undefined
                        ? `${Math.floor(seg.startTime / 60)}:${Math.floor(seg.startTime % 60).toString().padStart(2, '0')}`
                        : seg.startTime}
                    </span>
                  </div>
                  <p className="text-[#edeae1] leading-relaxed">{seg.editedText || seg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Timeline Summary (only if events exist) */}
          {caseData.timeline && caseData.timeline.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
                6. Incident Chronological Timeline
              </h3>
              <div className="space-y-2 border-l-2 border-[#8a9a5b] pl-3 ml-1">
                {caseData.timeline.map((event) => (
                  <div key={event.id} className="text-xs">
                    <span className="font-mono font-semibold text-[#8a9a5b]">
                      [{event.timeLabel || `${event.timestamp}s`}]
                    </span>{' '}
                    <strong className="text-[#edeae1]">{event.title}</strong> —{' '}
                    <span className="text-[#9e9c96]">{event.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Officer Certification Block */}
          <div className="mt-8 rounded border border-[#35373e] bg-[#18191c] p-4 text-xs">
            <h4 className="font-semibold text-[#edeae1] mb-2 uppercase tracking-wide">
              Sworn Officer Attestation
            </h4>
            <p className="text-[#9e9c96] leading-relaxed">
              I, <strong className="text-[#edeae1]">{auditOfficer}</strong>, hereby certify that I have
              reviewed the automated acoustic and linguistic outputs generated by VECNAVERSE for Docket{' '}
              <strong className="text-[#edeae1]">{caseData.docketNumber || `#${caseData.id}`}</strong>. I have verified material findings
              against source recordings and confirmed the accuracy of the factual findings documented herein.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[#35373e] pt-3 text-[11px] text-[#71706b]">
              <span>Signature: __________________________</span>
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span>Badge / Token: {badgeToken}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#35373e] bg-[#18191c] p-3 text-xs text-[#9e9c96]">
          <span>Classification: CJIS Tier 4 / Law Enforcement Restricted</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Download CSV Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded bg-[#23252a] px-4 py-1.5 font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;

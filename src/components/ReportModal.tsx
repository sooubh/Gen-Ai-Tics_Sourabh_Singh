'use client';

import React from 'react';
import { Case, DISCLAIMER_LEGAL_EVIDENCE, DISCLAIMER_ADVISORY_VOCAL_METRICS } from '@/types';
import { Printer, Download, X, Shield, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: Case | null;
}

export function ReportModal({ isOpen, onClose, caseData }: ReportModalProps) {
  if (!isOpen || !caseData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate sanitized CSV with formula injection defense
    const sanitize = (text: string | number | undefined | null) => {
      if (text === undefined || text === null) return '""';
      let str = String(text).replace(/"/g, '""');
      // Neutralize CSV formula characters: =, +, -, @, \t, \r
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const rows: string[] = [];
    rows.push(['Report Type', 'VECNAVERSE Forensic Case Dossier'].map(sanitize).join(','));
    rows.push(['Case ID', caseData.id].map(sanitize).join(','));
    rows.push(['Title', caseData.title].map(sanitize).join(','));
    rows.push(['Officer', caseData.officerName].map(sanitize).join(','));
    rows.push(['Classification', caseData.classificationStandard].map(sanitize).join(','));
    rows.push(['Generated At', new Date().toISOString()].map(sanitize).join(','));
    rows.push('');

    rows.push(['--- EXTRACTED ENTITIES ---'].map(sanitize).join(','));
    rows.push(['Type', 'Spoken Form', 'Normalized / Detail', 'Confidence', 'Verification Status'].map(sanitize).join(','));
    caseData.entities.forEach((ent) => {
      rows.push([
        ent.type,
        ent.value || ent.text || '',
        ent.normalizedValue || ent.detail || '',
        `${ent.confidence}%`,
        ent.verificationStatus || ent.status || 'unverified',
      ].map(sanitize).join(','));
    });
    rows.push('');

    rows.push(['--- EMERGENCY & THREAT TRIGGERS ---'].map(sanitize).join(','));
    rows.push(['Category', 'Severity', 'Quote', 'Time Offset', 'Confidence', 'Context', 'Status'].map(sanitize).join(','));
    caseData.triggers.forEach((trig) => {
      const timeOffsetStr = trig.timeOffset || (trig.timestamp !== undefined ? `${Math.floor(trig.timestamp / 60)}:${Math.floor(trig.timestamp % 60).toString().padStart(2, '0')}` : '00:00');
      rows.push([
        trig.category || trig.type || '',
        trig.severity,
        trig.quote,
        timeOffsetStr,
        `${trig.confidence}%`,
        trig.context || trig.contextTag || 'direct',
        trig.verificationStatus || trig.status || 'pending',
      ].map(sanitize).join(','));
    });
    rows.push('');

    rows.push(['--- ADVISORY VOCAL INDICATORS (NON-EVIDENTIARY) ---'].map(sanitize).join(','));
    rows.push(['Indicator Type', 'Score', 'Variance Level', 'Description', 'Disclaimer'].map(sanitize).join(','));
    caseData.vocalIndicators.forEach((voc) => {
      rows.push([
        voc.title || voc.metricName || voc.type,
        voc.score || voc.value || '',
        voc.variance || voc.trend || '',
        voc.description,
        DISCLAIMER_ADVISORY_VOCAL_METRICS,
      ].map(sanitize).join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `VECNAVERSE_${caseData.id}_Dossier.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(caseData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VECNAVERSE_${caseData.id}_Dossier.json`;
    link.click();
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
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#8a9a5b]">
                  {caseData.docketNumber || `#${caseData.id}`}
                </span>
                <span className="rounded bg-[#23252a] px-2 py-0.5 text-[10px] font-medium text-[#9e9c96] border border-[#35373e]">
                  INVESTIGATION DOSSIER
                </span>
              </div>
              <h2 className="text-base font-semibold text-[#edeae1]">{caseData.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded bg-[#23252a] px-3 py-1.5 text-xs font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-[#9e9c96]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="rounded p-1.5 text-[#9e9c96] hover:bg-[#23252a] hover:text-[#edeae1] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-[#edeae1]" id="printable-dossier">
          {/* Official Enclave Banner */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded border border-[#35373e] bg-[#18191c] p-4">
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
              <div className="text-[#9e9c96]">Officer: {caseData.officerName}</div>
              <div className="text-[#71706b]">Generated: {new Date().toLocaleString()}</div>
            </div>
          </div>

          {/* Legal / Non-Evidentiary Disclaimer */}
          <div className="mb-6 rounded border border-[#b87a28]/40 bg-[#b87a28]/10 p-3 text-xs text-[#ffb964] flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#ffb964] mt-0.5" />
            <div>
              <span className="font-bold">LEGAL & ETHICAL NOTICE:</span> {DISCLAIMER_LEGAL_EVIDENCE}{' '}
              {DISCLAIMER_ADVISORY_VOCAL_METRICS}
            </div>
          </div>

          {/* Case Overview */}
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
              1. Case & Audio Evidence Metadata
            </h3>
            <div className="grid grid-cols-2 gap-2 rounded border border-[#35373e] bg-[#18191c] p-3 text-xs md:grid-cols-4">
              <div>
                <span className="text-[#9e9c96]">Docket Number:</span>
                <p className="font-mono font-semibold text-[#edeae1]">{caseData.docketNumber}</p>
              </div>
              <div>
                <span className="text-[#9e9c96]">Status:</span>
                <p className="font-medium text-[#8a9a5b]">{caseData.status}</p>
              </div>
              <div>
                <span className="text-[#9e9c96]">Audio Duration:</span>
                <p className="font-mono text-[#edeae1]">
                  {caseData.audioMetadata?.durationSeconds
                    ? `${Math.floor(caseData.audioMetadata.durationSeconds / 60)}:${Math.floor(caseData.audioMetadata.durationSeconds % 60).toString().padStart(2, '0')}`
                    : caseData.audioDuration || '18:45'}
                </p>
              </div>
              <div>
                <span className="text-[#9e9c96]">Chain of Custody:</span>
                <p className="font-mono text-[10px] text-[#edeae1] truncate">
                  {caseData.audioMetadata?.sha256Hash || caseData.chainOfCustodyHash || 'SHA256: 8a4f09c2...d7e1'}
                </p>
              </div>
            </div>
          </div>

          {/* Flagged Emergency & Threat Triggers */}
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#b84a44]">
              2. Flagged Emergency & Threat Triggers
            </h3>
            {caseData.triggers.length === 0 ? (
              <p className="text-xs text-[#9e9c96] italic">No high-risk triggers detected in analyzed audio.</p>
            ) : (
              <div className="space-y-2">
                {caseData.triggers.map((trig) => (
                  <div
                    key={trig.id}
                    className="rounded border border-[#b84a44]/40 bg-[#401311]/20 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-1">
                      <span className="font-mono font-bold text-[#d96f68]">
                        {trig.title || trig.category || trig.type}
                      </span>
                      <span className="rounded bg-[#401311] px-1.5 py-0.5 font-mono text-[10px] text-[#d96f68] border border-[#b84a44]/40">
                        {trig.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-serif italic text-[#edeae1] my-1">"{trig.quote}"</p>
                    <div className="flex items-center justify-between text-[11px] text-[#9e9c96] pt-1 border-t border-[#35373e]/50">
                      <span>Offset: {trig.timeOffset || `${trig.timestamp}s`}</span>
                      <span>Confidence: {trig.confidence}%</span>
                      <span className="font-medium text-[#8a9a5b]">
                        Status: {trig.verificationStatus || trig.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Named Entities */}
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
              3. Spoken Entity Extractions
            </h3>
            <div className="overflow-x-auto rounded border border-[#35373e]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18191c] text-[#9e9c96] border-b border-[#35373e]">
                  <tr>
                    <th className="p-2">Type</th>
                    <th className="p-2">Spoken Entity</th>
                    <th className="p-2">Forensic Detail / Normalization</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35373e] bg-[#23252a]">
                  {caseData.entities.map((ent) => (
                    <tr key={ent.id} className="hover:bg-[#2d2f36]/40">
                      <td className="p-2 font-mono text-[#8a9a5b]">{ent.type}</td>
                      <td className="p-2 font-semibold text-[#edeae1]">{ent.value || ent.text}</td>
                      <td className="p-2 text-[#9e9c96]">{ent.normalizedValue || ent.detail || '—'}</td>
                      <td className="p-2 font-mono">{ent.confidence}%</td>
                      <td className="p-2 text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-[#5a8264]/20 px-1.5 py-0.5 text-[10px] text-[#7ea886]">
                          <CheckCircle2 className="h-3 w-3" />
                          {ent.verificationStatus || ent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Synchronized Transcript Excerpt */}
          <div className="mb-6">
            <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
              4. Synchronized Forensic Transcript
            </h3>
            <div className="space-y-2 rounded border border-[#35373e] bg-[#18191c] p-3">
              {caseData.segments.map((seg) => (
                <div key={seg.id} className="rounded bg-[#23252a] p-2.5 text-xs border border-[#35373e]">
                  <div className="flex items-center justify-between text-[#9e9c96] font-mono text-[11px] mb-1">
                    <span className="font-semibold text-[#edeae1]">
                      {typeof seg.speaker === 'string'
                        ? seg.speaker
                        : (seg.speaker?.provisionalLabel || seg.speaker?.speakerId || seg.speakerLabel || seg.speakerId || 'Speaker')}
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

          {/* Timeline Summary */}
          {caseData.timeline && caseData.timeline.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#8a9a5b]">
                5. Incident Chronological Timeline
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
              I, <strong className="text-[#edeae1]">{caseData.officerName}</strong>, hereby certify that I have
              reviewed the automated acoustic and linguistic outputs generated by VECNAVERSE for Docket{' '}
              <strong className="text-[#edeae1]">{caseData.docketNumber}</strong>. I have verified material findings
              against source recordings and confirmed the accuracy of the factual findings documented herein.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[#35373e] pt-3 text-[11px] text-[#71706b]">
              <span>Signature: __________________________</span>
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span>Badge / Token: #4829-SCI</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#35373e] bg-[#18191c] p-3 text-xs text-[#9e9c96]">
          <span>Classification: CJIS Tier 4 / TS-SCI</span>
          <button
            onClick={onClose}
            className="rounded bg-[#23252a] px-4 py-1.5 font-medium text-[#edeae1] hover:bg-[#2d2f36] border border-[#35373e] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;

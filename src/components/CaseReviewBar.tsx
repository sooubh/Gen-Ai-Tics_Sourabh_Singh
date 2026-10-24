'use client';

import React from 'react';
import { Case } from '@/types';
import { FileText, Share2, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { isSyntheticCase } from '@/lib/data/store';

interface CaseReviewBarProps {
  caseData: Case;
  onOpenReport: () => void;
  onExportPackage: () => void;
  onValidateAll: () => void;
  onPurgeAudio?: () => void;
}

export function CaseReviewBar({
  caseData,
  onOpenReport,
  onExportPackage,
  onValidateAll,
  onPurgeAudio,
}: CaseReviewBarProps) {
  return (
    <header className="w-full bg-[#18191c] border-b border-[#35373e] px-4 py-3 backdrop-blur-md">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Metadata Badges */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#292a2c] text-[#8a9a5b] font-semibold tracking-wider border border-[#35373e]">
              {caseData.docketNumber || `#${caseData.id}`}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#23252a] text-[#9e9c96] border border-[#35373e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b]" />
              Status: <strong className="text-[#edeae1] ml-0.5 font-medium">{caseData.status}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#23252a] text-[#9e9c96] border border-[#35373e]">
              Officer: <strong className="text-[#edeae1] ml-0.5 font-medium">{caseData.officerName}</strong>
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#23252a] text-[#71706b] border border-[#35373e]">
              {caseData.intakeTimestamp || 'May 14, 2025 • 13:42:00 UTC'}
            </span>
            <span className="hidden md:inline px-2 py-0.5 rounded bg-[#0d0e10] text-[#71706b] border border-[#35373e]">
              {caseData.evidenceId || '#AUD-0892-FLAC'}
            </span>
            {isSyntheticCase(caseData) && (
              <span className="px-2 py-0.5 rounded bg-[#422006] text-[#ffb964] border border-[#ffb964]/50 font-bold inline-flex items-center gap-1 shadow-sm">
                <AlertTriangle className="h-3 w-3 text-[#ffb964]" />
                SYNTHETIC DEMO DATA
              </span>
            )}
            {caseData.audioMetadata?.purged && (
              <span className="rounded bg-[#401311] px-2 py-0.5 text-[#d96f68] border border-[#b84a44]/40 font-bold">
                AUDIO PURGED (RETENTION COMPLIANT)
              </span>
            )}
          </div>
          <h1 className="text-base lg:text-lg font-semibold text-[#edeae1] tracking-tight mt-0.5">
            {caseData.title}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-start xl:justify-end flex-wrap">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#23252a] border border-[#35373e] text-[#edeae1] hover:bg-[#2d2f36] transition-colors text-xs font-medium"
          >
            <FileText className="h-3.5 w-3.5 text-[#9e9c96]" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={onExportPackage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#23252a] border border-[#35373e] text-[#edeae1] hover:bg-[#2d2f36] transition-colors text-xs font-medium"
          >
            <Share2 className="h-3.5 w-3.5 text-[#9e9c96]" />
            <span>Export Package</span>
          </button>

          <button
            onClick={onValidateAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#7d8c52] text-[#161f00] hover:bg-[#8a9a5b] text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Validate Findings</span>
          </button>

          {onPurgeAudio && !caseData.audioMetadata?.purged && (
            <button
              onClick={onPurgeAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#401311]/60 border border-[#b84a44]/50 text-[#d96f68] hover:bg-[#b84a44]/20 transition-colors text-xs font-medium"
              title="Purge audio file in accordance with retention policy"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Purge Audio</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

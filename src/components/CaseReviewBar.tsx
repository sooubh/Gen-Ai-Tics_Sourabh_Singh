'use client';

import Link from 'next/link';
import { Case } from '@/types';
import { FileText, Download, Trash2, ArrowLeft } from 'lucide-react';
import { isSyntheticCase } from '@/lib/data/store';

export interface OfficerInfo {
  id?: string;
  name?: string;
  badgeNumber?: string;
  role?: string;
}

export interface CaseReviewBarProps {
  caseData: Case;
  currentOfficer?: OfficerInfo;
  officerId?: string;
  officerName?: string;
  onOpenReport?: () => void;
  onGenerateReport?: () => void;
  onExportCase?: () => void;
  onExportPackage?: () => void;
  onDeleteAudio?: () => void;
  onPurgeAudio?: () => void;
  onValidateAll?: () => void;
}

export function CaseReviewBar({
  caseData,
  currentOfficer,
  officerId: _officerId,
  officerName,
  onOpenReport,
  onGenerateReport,
  onExportCase,
  onExportPackage,
  onDeleteAudio,
  onPurgeAudio,
}: CaseReviewBarProps) {
  const officerDisplayName =
    officerName ||
    currentOfficer?.name ||
    caseData.officerName ||
    caseData.assignedOfficerName ||
    caseData.investigatingOfficer ||
    'Attending Officer';

  const handleReport = () => {
    if (onOpenReport) onOpenReport();
    else if (onGenerateReport) onGenerateReport();
  };

  const handleExport = () => {
    if (onExportCase) onExportCase();
    else if (onExportPackage) onExportPackage();
  };

  const handleDelete = () => {
    if (onDeleteAudio) onDeleteAudio();
    else if (onPurgeAudio) onPurgeAudio();
  };

  const isAudioPurged = Boolean(caseData.audioMetadata?.purged);
  const hasAudioAttached = Boolean(
    !isAudioPurged && (caseData.audioUrl || caseData.audioMetadata?.storagePath)
  );

  return (
    <header className="w-full bg-[#18191c] border-b border-[#35373e] px-4 py-3 backdrop-blur-md">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Navigation & Header Metadata */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <Link
              href="/cases"
              className="inline-flex items-center gap-1 text-[#9e9c96] hover:text-[#edeae1] transition-colors mr-1"
              title="Return to Case Directory"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Cases</span>
            </Link>
            <span className="text-[#35373e]">/</span>
            <span className="px-2 py-0.5 rounded bg-[#292a2c] text-[#8a9a5b] font-semibold tracking-wider border border-[#35373e]">
              {caseData.docketNumber || `#${caseData.id}`}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#23252a] text-[#9e9c96] border border-[#35373e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b]" />
              Status: <strong className="text-[#edeae1] ml-0.5 font-medium">{caseData.status}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#23252a] text-[#9e9c96] border border-[#35373e]">
              Officer: <strong className="text-[#edeae1] ml-0.5 font-medium">{officerDisplayName}</strong>
            </span>
            {caseData.intakeTimestamp && (
              <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#23252a] text-[#71706b] border border-[#35373e]">
                {caseData.intakeTimestamp}
              </span>
            )}
            {isAudioPurged && (
              <span className="rounded bg-[#401311] px-2 py-0.5 text-[#d96f68] border border-[#b84a44]/40 font-bold">
                AUDIO PURGED
              </span>
            )}
            {isSyntheticCase(caseData) && (
              <span className="rounded bg-[#422006] px-2 py-0.5 font-mono text-[10px] font-bold text-[#ffb964] border border-[#ffb964]/40">
                DEMO FIXTURE
              </span>
            )}
          </div>
          <h1 className="text-base lg:text-lg font-semibold text-[#edeae1] tracking-tight truncate">
            {caseData.title}
          </h1>
        </div>

        {/* Essential Actions: Generate Report, Export Case, Delete Audio */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-start xl:justify-end flex-wrap">
          {/* Action 1: Generate Report */}
          <button
            type="button"
            onClick={handleReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#23252a] border border-[#35373e] text-[#edeae1] hover:bg-[#2d2f36] transition-colors text-xs font-medium shadow-sm"
            title="Generate and view printable forensic case dossier"
          >
            <FileText className="h-3.5 w-3.5 text-[#9e9c96]" />
            <span>Generate Report</span>
          </button>

          {/* Action 2: Export Case */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#23252a] border border-[#35373e] text-[#edeae1] hover:bg-[#2d2f36] transition-colors text-xs font-medium shadow-sm"
            title="Export case evidence package"
          >
            <Download className="h-3.5 w-3.5 text-[#9e9c96]" />
            <span>Export Case</span>
          </button>

          {/* Action 3: Delete Audio */}
          {(onDeleteAudio || onPurgeAudio) && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isAudioPurged || !hasAudioAttached}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isAudioPurged || !hasAudioAttached
                  ? 'bg-[#23252a] border border-[#35373e] text-[#71706b] cursor-not-allowed'
                  : 'bg-[#401311]/60 border border-[#b84a44]/50 text-[#d96f68] hover:bg-[#b84a44]/20'
              }`}
              title={
                isAudioPurged
                  ? 'Audio recording was already purged per retention policy'
                  : !hasAudioAttached
                  ? 'No audio file attached to this case'
                  : 'Permanently delete audio recording per CJIS retention policy'
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Audio</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

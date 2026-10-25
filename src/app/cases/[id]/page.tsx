'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { store, isSyntheticCase } from '@/lib/data/store';
import { Case } from '@/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SynchronizedTranscript } from '@/components/SynchronizedTranscript';
import { EntityList } from '@/components/EntityList';
import { TriggerList } from '@/components/TriggerList';
import { TimelineView } from '@/components/TimelineView';
import { VocalIndicatorCard } from '@/components/VocalIndicatorCard';
import { CaseReviewBar } from '@/components/CaseReviewBar';
import { ReportModal } from '@/components/ReportModal';
import { ArrowLeft, AlertCircle, FileAudio, HeartPulse } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const data = store.getCaseById(caseId);
    if (data) {
      setCaseData(data);
    }

    // Synchronize latest case record from server enclave
    fetch(`/api/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (serverData && !serverData.error) {
          setCaseData(serverData);
          store.upsertCase(serverData);
        }
      })
      .catch((err) => {
        console.warn('Could not sync case from server enclave:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [caseId]);

  const refreshCaseData = (id: string) => {
    const updated = store.getCaseById(id);
    if (updated) {
      setCaseData({
        ...updated,
        entities: [...(updated.entities || [])],
        triggers: [...(updated.triggers || [])],
        segments: [...(updated.segments || [])],
        reviews: [...(updated.reviews || [])],
        timeline: [...(updated.timeline || [])],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121315] text-[#edeae1]">
        <div className="text-center font-mono text-xs text-[#9e9c96]">
          Loading forensic case dossier {caseId}...
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#121315] text-[#edeae1]">
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-[#d96f68]" />
          <h2 className="mb-2 text-xl font-bold font-mono">Case Docket Not Found</h2>
          <p className="mb-6 text-xs text-[#9e9c96]">
            The requested cybercrime case identifier <code className="text-[#edeae1]">{caseId}</code> could not be located in the local enclave.
          </p>
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 rounded bg-[#23252a] px-4 py-2 text-xs font-semibold text-[#edeae1] border border-[#35373e] hover:bg-[#292a2c]"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Case Directory
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic session/officer derivation (no hardcoded officer names)
  const effectiveOfficerId =
    caseData.officerId ||
    caseData.leadInvestigatorId ||
    'OFFICER-DUTY';
  const effectiveOfficerName =
    caseData.officerName ||
    caseData.assignedOfficerName ||
    caseData.investigatingOfficer ||
    'Attending Officer';

  // Audio configuration & real audio verification
  const isAudioPurged = Boolean(caseData.audioMetadata?.purged);
  const audioUrl: string | undefined = isAudioPurged
    ? undefined
    : caseData.audioUrl ||
      (caseData.audioMetadata?.storagePath && !isSyntheticCase(caseData)
        ? `/api/upload?path=${encodeURIComponent(caseData.audioMetadata.storagePath)}`
        : undefined);
  const hasRealAudio = Boolean(audioUrl) && !isAudioPurged;
  const totalDuration = caseData.audioMetadata?.durationSeconds || 0;
  const firstThreat = caseData.triggers.find((t) => t.severity === 'critical' || t.severity === 'high');

  const handlePlayToggle = () => {
    if (!hasRealAudio) return;
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const syncReviewApi = (reviewAction: {
    targetType: string;
    targetId: string;
    action: string;
    newValue?: string;
    reason?: string;
  }) => {
    fetch(`/api/cases/${caseData.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...reviewAction,
        officerId: effectiveOfficerId,
        officerName: effectiveOfficerName,
      }),
    }).catch((err) => console.warn('Review API background sync failed:', err));
  };

  const handleConfirmEntity = (entityId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'finding',
      targetId: entityId,
      action: 'confirm',
      officerId: effectiveOfficerId,
      officerName: effectiveOfficerName,
    });
    syncReviewApi({ targetType: 'finding', targetId: entityId, action: 'confirm' });
    refreshCaseData(caseData.id);
  };

  const handleDismissEntity = (entityId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'finding',
      targetId: entityId,
      action: 'dismiss',
      officerId: effectiveOfficerId,
      officerName: effectiveOfficerName,
    });
    syncReviewApi({ targetType: 'finding', targetId: entityId, action: 'dismiss' });
    refreshCaseData(caseData.id);
  };

  const handleConfirmTrigger = (triggerId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'trigger',
      targetId: triggerId,
      action: 'confirm',
      officerId: effectiveOfficerId,
      officerName: effectiveOfficerName,
    });
    syncReviewApi({ targetType: 'trigger', targetId: triggerId, action: 'confirm' });
    refreshCaseData(caseData.id);
  };

  const handleDismissTrigger = (triggerId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'trigger',
      targetId: triggerId,
      action: 'dismiss',
      officerId: effectiveOfficerId,
      officerName: effectiveOfficerName,
    });
    syncReviewApi({ targetType: 'trigger', targetId: triggerId, action: 'dismiss' });
    refreshCaseData(caseData.id);
  };

  const handleEditSegment = (segmentId: string, newText: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'transcript',
      targetId: segmentId,
      action: 'correct',
      newValue: newText,
      officerId: effectiveOfficerId,
      officerName: effectiveOfficerName,
    });
    syncReviewApi({ targetType: 'transcript', targetId: segmentId, action: 'correct', newValue: newText });
    refreshCaseData(caseData.id);
  };

  // Essential Action: Delete Audio
  const handleDeleteAudio = () => {
    if (confirm('Permanently delete audio recording file for this case per CJIS retention policy?')) {
      store.purgeAudio(caseData.id);
      refreshCaseData(caseData.id);
    }
  };

  // Essential Action: Export Case
  const handleExportCase = () => {
    const jsonStr = JSON.stringify(
      {
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          docketNumber: caseData.docketNumber || `#${caseData.id}`,
          incidentTitle: caseData.title,
          status: caseData.status,
          officerName: effectiveOfficerName,
          officerId: effectiveOfficerId,
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
    link.download = `case-${safeDocket}-evidence.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Emotion analysis real data check
  const hasRealEmotionData = Boolean(
    caseData.emotionProfile &&
      (caseData.emotionProfile.primaryEmotion ||
        (caseData.emotionProfile.emotions &&
          Object.values(caseData.emotionProfile.emotions).some((v) => typeof v === 'number' && v > 0)))
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#121315] text-[#edeae1]">
      {/* 1. Case Title, Status & 8. Essential Actions Header */}
      <CaseReviewBar
        caseData={caseData}
        officerId={effectiveOfficerId}
        officerName={effectiveOfficerName}
        onOpenReport={() => setIsReportOpen(true)}
        onExportCase={handleExportCase}
        onDeleteAudio={handleDeleteAudio}
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 2. Audio Playback, Filename, and Duration */}
        {hasRealAudio ? (
          <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 shadow-sm">
            <AudioPlayer
              currentTime={currentTime}
              duration={totalDuration}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
              onSeek={handleSeek}
              filename={caseData.audioMetadata?.filename || 'evidence_recording.wav'}
              format={caseData.audioMetadata?.format || 'PCM 16-bit / 44.1 kHz'}
              threatTimestamp={firstThreat?.evidence?.startTime}
              audioUrl={audioUrl}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#23252a] text-[#9e9c96] border border-[#35373e]">
                <FileAudio className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#edeae1]">
                    {caseData.audioMetadata?.filename || 'No audio recording attached'}
                  </span>
                  <span className="rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#9e9c96] border border-[#35373e]">
                    {isAudioPurged ? 'Audio Purged (Retention Compliant)' : 'No audio file attached'}
                  </span>
                </div>
                <p className="text-xs text-[#9e9c96] mt-0.5">
                  {isAudioPurged
                    ? 'The audio evidence was purged in accordance with CJIS retention standards. Forensic transcript and metadata remain intact.'
                    : 'No media file is attached to this case. Audio playback is unavailable.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-[#9e9c96] flex-shrink-0">
              {totalDuration > 0 && (
                <span>
                  Recorded Duration: <strong className="text-[#edeae1]">{Math.floor(totalDuration / 60)}:{Math.floor(totalDuration % 60).toString().padStart(2, '0')}</strong>
                </span>
              )}
              {caseData.audioMetadata?.format && (
                <span className="hidden md:inline text-[#71706b]">
                  [{caseData.audioMetadata.format}]
                </span>
              )}
            </div>
          </div>
        )}

        {/* Forensic Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 3. Timestamped Synchronized Transcript (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <SynchronizedTranscript
              segments={caseData.segments}
              cues={caseData.vocalIndicators || []}
              currentTime={currentTime}
              onSeek={handleSeek}
              onEditSegment={handleEditSegment}
            />
          </div>

          {/* Intelligence Findings & Analytics (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 4. Real Detected Keywords and Threat Indicators */}
            <TriggerList
              triggers={caseData.triggers}
              onConfirmTrigger={handleConfirmTrigger}
              onDismissTrigger={handleDismissTrigger}
              onSeekToTrigger={handleSeek}
            />

            {/* 5. Extracted People, Phone Numbers, Locations, and Organizations */}
            <EntityList
              entities={caseData.entities}
              onConfirmEntity={handleConfirmEntity}
              onDismissEntity={handleDismissEntity}
              onSeekToEntity={(ts) => ts !== undefined && handleSeek(ts)}
            />

            {/* 6. Emotion Analysis (ONLY when genuine results exist) */}
            {hasRealEmotionData ? (
              <VocalIndicatorCard
                indicators={caseData.vocalIndicators || []}
                emotionProfile={caseData.emotionProfile}
              />
            ) : (
              <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-[#71706b]" />
                    <h3 className="text-sm font-semibold text-[#edeae1]">
                      Speech Emotion Recognition & Acoustics
                    </h3>
                  </div>
                  <span className="rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#71706b] border border-[#35373e]">
                    No Data
                  </span>
                </div>
                <p className="text-xs text-[#9e9c96] leading-relaxed">
                  No acoustic speech emotion profile or vocal stress indicators have been analyzed for this case docket.
                </p>
              </div>
            )}

            {/* 7. Incident Timeline (ONLY when real events exist) */}
            {caseData.timeline && caseData.timeline.length > 0 && (
              <TimelineView events={caseData.timeline} onSeek={handleSeek} />
            )}
          </div>
        </div>
      </main>

      {/* Printable Dossier & CSV/JSON Export Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        caseData={caseData}
        officerId={effectiveOfficerId}
        officerName={effectiveOfficerName}
      />
    </div>
  );
}

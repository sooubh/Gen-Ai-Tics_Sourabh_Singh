'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/data/store';
import { Case, TranscriptSegment } from '@/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SynchronizedTranscript } from '@/components/SynchronizedTranscript';
import { EntityList } from '@/components/EntityList';
import { TriggerList } from '@/components/TriggerList';
import { TimelineView } from '@/components/TimelineView';
import { VocalIndicatorCard } from '@/components/VocalIndicatorCard';
import { CaseReviewBar } from '@/components/CaseReviewBar';
import { ReportModal } from '@/components/ReportModal';
import { ArrowLeft, AlertCircle, FileAudio, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;
  const router = useRouter();

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
    setLoading(false);
  }, [caseId]);

  // Active audio playback ticker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && caseData) {
      const maxDuration = caseData.audioMetadata?.durationSeconds || 185;
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= maxDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(maxDuration, +(prev + 0.2).toFixed(2));
        });
      }, 200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, caseData]);

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

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const syncReviewApi = (reviewAction: { targetType: string; targetId: string; action: string; newValue?: string; reason?: string }) => {
    fetch(`/api/cases/${caseData.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...reviewAction,
        officerId: 'JENKINS-4829',
        officerName: 'Det. S. Jenkins #4829',
      }),
    }).catch((err) => console.warn('Review API background sync failed:', err));
  };

  const handleConfirmEntity = (entityId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'finding',
      targetId: entityId,
      action: 'confirm',
      officerId: 'JENKINS-4829',
      officerName: 'Det. S. Jenkins #4829',
    });
    syncReviewApi({ targetType: 'finding', targetId: entityId, action: 'confirm' });
    setCaseData(store.getCaseById(caseData.id));
  };

  const handleDismissEntity = (entityId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'finding',
      targetId: entityId,
      action: 'dismiss',
      officerId: 'JENKINS-4829',
      officerName: 'Det. S. Jenkins #4829',
    });
    syncReviewApi({ targetType: 'finding', targetId: entityId, action: 'dismiss' });
    setCaseData(store.getCaseById(caseData.id));
  };

  const handleConfirmTrigger = (triggerId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'trigger',
      targetId: triggerId,
      action: 'confirm',
      officerId: 'JENKINS-4829',
      officerName: 'Det. S. Jenkins #4829',
    });
    syncReviewApi({ targetType: 'trigger', targetId: triggerId, action: 'confirm' });
    setCaseData(store.getCaseById(caseData.id));
  };

  const handleDismissTrigger = (triggerId: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'trigger',
      targetId: triggerId,
      action: 'dismiss',
      officerId: 'JENKINS-4829',
      officerName: 'Det. S. Jenkins #4829',
    });
    syncReviewApi({ targetType: 'trigger', targetId: triggerId, action: 'dismiss' });
    setCaseData(store.getCaseById(caseData.id));
  };

  const handleEditSegment = (segmentId: string, newText: string) => {
    store.recordReview(caseData.id, {
      caseId: caseData.id,
      targetType: 'transcript',
      targetId: segmentId,
      action: 'correct',
      newValue: newText,
      officerId: 'JENKINS-4829',
      officerName: 'Det. S. Jenkins #4829',
    });
    syncReviewApi({ targetType: 'transcript', targetId: segmentId, action: 'correct', newValue: newText });
    setCaseData(store.getCaseById(caseData.id));
  };

  const handleValidateAll = () => {
    store.updateCase(caseData.id, {
      status: 'officer_verified',
    });
    store.logAuditEvent({
      action: 'OFFICER_SIGN_OFF',
      actorId: 'JENKINS-4829',
      actorName: 'Det. S. Jenkins #4829',
      resourceType: 'case',
      resourceId: caseData.id,
      details: 'Officer complete sign-off performed on case findings and transcript.',
      enclaveSecurityLevel: 'TOP SECRET // SCI',
    });
    setCaseData(store.getCaseById(caseData.id));
  };

  const handlePurgeAudio = () => {
    if (confirm('Permanently purge audio recording file for this case per CJIS retention policy?')) {
      store.purgeAudio(caseData.id);
      setCaseData(store.getCaseById(caseData.id));
    }
  };

  const totalDuration = caseData.audioMetadata?.durationSeconds || 60;
  const firstThreat = caseData.triggers.find((t) => t.severity === 'critical' || t.severity === 'high');

  return (
    <div className="flex min-h-screen flex-col bg-[#121315] text-[#edeae1]">
      {/* Review Action Top Bar */}
      <CaseReviewBar
        caseData={caseData}
        onOpenReport={() => setIsReportOpen(true)}
        onExportPackage={() => setIsReportOpen(true)}
        onValidateAll={handleValidateAll}
        onPurgeAudio={handlePurgeAudio}
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumb & Caller Triage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18191c] p-3.5 rounded-lg border border-[#35373e]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9e9c96] hover:text-[#edeae1] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Call Triage Queue
              </Link>
              <span className="text-[#35373e]">/</span>
              <span className="font-mono text-xs text-[#8a9a5b] font-bold">{caseData.docketNumber}</span>
              {caseData.urgencyScore && (
                <span className="rounded bg-[#401311] px-2 py-0.5 font-mono text-[10px] font-bold text-[#d96f68] border border-[#b84a44]/50 animate-pulse">
                  URGENCY: {caseData.urgencyScore}/100 [{caseData.urgencyLevel || 'HIGH'}]
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#9e9c96]">
              <span>Caller: <strong className="text-[#edeae1]">{caseData.callerName || 'Unknown Caller'}</strong></span>
              <span>|</span>
              <span>Phone: <code className="text-[#edeae1]">{caseData.callerPhone || 'Unlisted'}</code></span>
              <span>|</span>
              <span>Category: <strong className="text-[#ffb964]">{caseData.callerCategory?.replace('_', ' ').toUpperCase() || 'VICTIM'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#9e9c96]">
            <span>Attending Desk:</span>
            <span className="text-[#edeae1] font-semibold">{caseData.officerName || 'Insp. R. Deshmukh #4829'}</span>
          </div>
        </div>

        {/* Audio Player Scrubber Section */}
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
          />
        </div>

        {/* Split Forensic Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Synchronized Transcript (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <SynchronizedTranscript
              segments={caseData.segments}
              currentTime={currentTime}
              onSeek={handleSeek}
              onEditSegment={handleEditSegment}
            />
          </div>

          {/* Right Column: Intelligence Findings & Telemetry (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Triggers */}
            <TriggerList
              triggers={caseData.triggers}
              onConfirmTrigger={handleConfirmTrigger}
              onDismissTrigger={handleDismissTrigger}
              onSeekToTrigger={handleSeek}
            />

            {/* Extracted Entities */}
            <EntityList
              entities={caseData.entities}
              onConfirmEntity={handleConfirmEntity}
              onDismissEntity={handleDismissEntity}
              onSeekToEntity={(ts) => ts !== undefined && handleSeek(ts)}
            />

            {/* Speech Emotion Recognition & Vocal Acoustics */}
            <VocalIndicatorCard
              indicators={caseData.vocalIndicators || []}
              emotionProfile={caseData.emotionProfile}
            />

            {/* Incident Chronological Timeline */}
            {caseData.timeline && caseData.timeline.length > 0 && (
              <TimelineView events={caseData.timeline} onSeek={handleSeek} />
            )}
          </div>
        </div>
      </main>

      {/* Printable Dossier & CSV Export Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        caseData={caseData}
      />
    </div>
  );
}

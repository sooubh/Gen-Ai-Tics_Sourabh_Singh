'use client';

import { VocalIndicator, SpeechEmotionProfile } from '@/types';
import { HeartPulse, ShieldAlert, AlertTriangle, Activity, Volume2 } from 'lucide-react';

interface VocalIndicatorCardProps {
  indicators: VocalIndicator[];
  emotionProfile?: SpeechEmotionProfile;
}

export function VocalIndicatorCard({ indicators, emotionProfile }: VocalIndicatorCardProps) {
  const getEmotionBadgeStyle = (emotion?: string) => {
    switch (emotion?.toLowerCase()) {
      case 'anger':
        return 'text-[#fb923c] bg-[#431407] border-[#ea580c]/50';
      case 'sadness':
        return 'text-[#60a5fa] bg-[#172554] border-[#3b82f6]/50';
      case 'fear':
        return 'text-[#f43f5e] bg-[#4c0519] border-[#e11d48]/50';
      case 'happiness':
        return 'text-[#fbbf24] bg-[#422006] border-[#d97706]/50';
      case 'stress':
      case 'distress':
      case 'nervousness':
        return 'text-[#c084fc] bg-[#2e1065] border-[#9333ea]/50';
      case 'neutral':
      case 'calm':
        return 'text-[#8a9a5b] bg-[#1a2e1f] border-[#5a8264]/50';
      default:
        return 'text-[#edeae1] bg-[#23252a] border-[#35373e]';
    }
  };

  const getAudioQualityStyle = (quality?: string) => {
    switch (quality?.toLowerCase()) {
      case 'clear':
        return { label: 'Audio: Clear', style: 'text-[#8a9a5b] bg-[#1a2e1f] border-[#5a8264]/50' };
      case 'noisy':
        return { label: 'Audio: Noisy', style: 'text-[#fbbf24] bg-[#422006] border-[#d97706]/50' };
      case 'distorted':
        return { label: 'Audio: Distorted', style: 'text-[#f43f5e] bg-[#4c0519] border-[#e11d48]/50' };
      case 'low_volume':
        return { label: 'Audio: Low Volume', style: 'text-[#93c5fd] bg-[#1e293b] border-[#3b82f6]/40' };
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity?: string, score?: number) => {
    let resolved = severity?.toLowerCase();
    if (!resolved && score !== undefined) {
      if (score >= 80) resolved = 'critical';
      else if (score >= 60) resolved = 'high';
      else if (score >= 40) resolved = 'medium';
      else resolved = 'low';
    }

    switch (resolved) {
      case 'critical':
        return { label: 'CRITICAL', style: 'text-[#f43f5e] bg-[#4c0519] border-[#e11d48]/50' };
      case 'high':
        return { label: 'HIGH', style: 'text-[#fb923c] bg-[#431407] border-[#ea580c]/50' };
      case 'medium':
        return { label: 'MEDIUM', style: 'text-[#fbbf24] bg-[#422006] border-[#d97706]/40' };
      case 'low':
      default:
        return { label: 'LOW', style: 'text-[#8a9a5b] bg-[#1a2e1f] border-[#5a8264]/40' };
    }
  };

  const formatTimestamp = (time?: number) => {
    if (time === undefined || time === null || isNaN(time)) return null;
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Compute all 6 target emotions
  const emotions = emotionProfile?.emotions;
  const angerScore = Math.min(100, Math.max(0, Math.round(((emotions?.anger ?? 0)) * 100)));
  const sadnessScore = Math.min(100, Math.max(0, Math.round(((emotions?.sadness ?? 0)) * 100)));
  const fearScore = Math.min(100, Math.max(0, Math.round(((emotions?.fear ?? 0)) * 100)));
  const happinessScore = Math.min(100, Math.max(0, Math.round(((emotions?.happiness ?? 0)) * 100)));
  const stressScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((emotions?.stress ?? emotions?.distress ?? emotions?.nervousness ?? 0)) * 100
      )
    )
  );
  const neutralScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(((emotions?.neutral ?? emotions?.calm ?? 0)) * 100)
    )
  );

  const confidenceScore = emotionProfile?.confidence !== undefined
    ? Math.round(emotionProfile.confidence > 1 ? emotionProfile.confidence : emotionProfile.confidence * 100)
    : null;

  const audioQuality = getAudioQualityStyle(emotionProfile?.audioQuality);

  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 shadow-sm flex flex-col gap-3.5">
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2.5">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-[#d96f68]" />
          <h3 className="text-sm font-semibold text-[#edeae1]">
            Speech Emotion Recognition (SER) & Acoustics
          </h3>
        </div>
        <span className="rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#ffb964] border border-[#ffb964]/30">
          Assistive Triage Only
        </span>
      </div>

      {/* Mandatory Responsible AI / Non-Lie-Detector Disclaimer */}
      <div className="rounded border border-[#b87a28]/40 bg-[#b87a28]/10 p-2.5 text-xs text-[#ffb964] flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 flex-shrink-0 text-[#ffb964] mt-0.5" />
        <p className="leading-snug text-[11px]">
          <strong>Responsible AI Notice:</strong> Emotion recognition provides indicative urgency cues only. It is <u>not a lie detector</u> and does not determine credibility, guilt, or intention. Attending officers retain full discretion.
        </p>
      </div>

      {/* Primary & Secondary Emotion Breakdown */}
      {emotionProfile && (
        <div className="space-y-3 rounded border border-[#35373e] bg-[#23252a] p-3">
          {/* Primary & Secondary Emotion Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#edeae1]">Caller Emotional State:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase border ${getEmotionBadgeStyle(
                  emotionProfile.primaryEmotion
                )}`}
              >
                Primary: {emotionProfile.primaryEmotion}
              </span>

              {emotionProfile.secondaryEmotion && (
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase border ${getEmotionBadgeStyle(
                    emotionProfile.secondaryEmotion
                  )}`}
                >
                  Secondary: {emotionProfile.secondaryEmotion}
                </span>
              )}
            </div>
          </div>

          {/* Uncertainty & Audio Quality Indicators */}
          {(confidenceScore !== null || audioQuality || emotionProfile.ambiguityFlag) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#35373e]/40 font-mono text-[10px]">
              {confidenceScore !== null && (
                <span className="rounded bg-[#18191c] px-2 py-0.5 text-[#edeae1] border border-[#35373e] flex items-center gap-1">
                  <Activity className="h-3 w-3 text-[#8a9a5b]" />
                  <span>Confidence: <strong className="text-[#8a9a5b]">{confidenceScore}%</strong></span>
                </span>
              )}

              {audioQuality && (
                <span className={`rounded px-2 py-0.5 font-bold border flex items-center gap-1 ${audioQuality.style}`}>
                  <Volume2 className="h-3 w-3" />
                  <span>{audioQuality.label}</span>
                </span>
              )}

              {emotionProfile.ambiguityFlag && (
                <span className="rounded bg-[#422006] px-2 py-0.5 text-[#ffb964] border border-[#ffb964]/40 font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-[#ffb964]" />
                  <span>Ambiguity Flagged</span>
                </span>
              )}
            </div>
          )}

          {/* Progress Bars for all 6 Target Emotions */}
          <div className="space-y-2.5 text-xs font-mono pt-1">
            {/* 1. Anger (Red/Orange) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#ea580c] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                  Anger & Hostility
                </span>
                <span className="text-[#edeae1] font-bold">{angerScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ea580c] to-[#dc2626] transition-all duration-300"
                  style={{ width: `${angerScore}%` }}
                />
              </div>
            </div>

            {/* 2. Sadness (Blue/Indigo) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#60a5fa] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]" />
                  Sadness & Despair
                </span>
                <span className="text-[#edeae1] font-bold">{sadnessScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#6366f1] transition-all duration-300"
                  style={{ width: `${sadnessScore}%` }}
                />
              </div>
            </div>

            {/* 3. Fear (Crimson/Ruby) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#f43f5e] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
                  Fear & Acute Panic
                </span>
                <span className="text-[#edeae1] font-bold">{fearScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f43f5e] to-[#be123c] transition-all duration-300"
                  style={{ width: `${fearScore}%` }}
                />
              </div>
            </div>

            {/* 4. Happiness (Yellow/Amber) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#fbbf24] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                  Happiness & Relief
                </span>
                <span className="text-[#edeae1] font-bold">{happinessScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] transition-all duration-300"
                  style={{ width: `${happinessScore}%` }}
                />
              </div>
            </div>

            {/* 5. Stress (Purple/Violet) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#c084fc] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                  Stress & Distress
                </span>
                <span className="text-[#edeae1] font-bold">{stressScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c084fc] to-[#7c3aed] transition-all duration-300"
                  style={{ width: `${stressScore}%` }}
                />
              </div>
            </div>

            {/* 6. Neutral (Green/Sage) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#8a9a5b] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b]" />
                  Neutral & Composure
                </span>
                <span className="text-[#edeae1] font-bold">{neutralScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8a9a5b] to-[#4ade80] transition-all duration-300"
                  style={{ width: `${neutralScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Acoustic Telemetry Metrics */}
          {emotionProfile.acousticMetrics && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#35373e]/50 font-mono text-[10px]">
              {emotionProfile.acousticMetrics.pitchJitterHz !== undefined && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Pitch Shift / Jitter:</span>
                  <p className="font-bold text-[#ffb964]">+{emotionProfile.acousticMetrics.pitchJitterHz} Hz</p>
                </div>
              )}
              {emotionProfile.acousticMetrics.speechRateWpm !== undefined && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Speech Rate:</span>
                  <p className="font-bold text-[#edeae1]">{emotionProfile.acousticMetrics.speechRateWpm} WPM</p>
                </div>
              )}
              {emotionProfile.acousticMetrics.vocalTremorScore !== undefined && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Vocal Tremor:</span>
                  <p className="font-bold text-[#d96f68]">{emotionProfile.acousticMetrics.vocalTremorScore}/100</p>
                </div>
              )}
              {emotionProfile.distressPeakTimestampSeconds !== undefined && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Distress Peak:</span>
                  <p className="font-bold text-[#8a9a5b]">At {emotionProfile.distressPeakTimestampSeconds}s</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Acoustic Cues List with Severity and Timestamps */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-semibold text-[#edeae1]">Detected Vocal Cues:</span>
          <span className="text-[10px] font-mono text-[#71706b]">{indicators.length} cue(s)</span>
        </div>

        {indicators.length === 0 ? (
          <p className="text-xs text-[#9e9c96] italic p-2 rounded border border-[#35373e] bg-[#23252a]/50">
            No anomalous acoustic stress variance detected or feature in abstention.
          </p>
        ) : (
          indicators.map((ind) => {
            const rawScore = ind.score ?? ind.metricValue;
            const sev = getSeverityBadge(ind.severity, typeof rawScore === 'number' ? rawScore : undefined);
            const cueTime = formatTimestamp(ind.timestamp ?? ind.startTime);

            return (
              <div
                key={ind.id}
                className="rounded border border-[#35373e] bg-[#23252a] p-2.5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#edeae1]">
                      {ind.title || ind.metricName || ind.type}
                    </span>
                    {cueTime && (
                      <span className="font-mono text-[10px] text-[#8a9a5b] bg-[#1a2e1f] px-1.5 py-0.2 rounded border border-[#5a8264]/30">
                        {cueTime}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold border ${sev.style}`}>
                      {sev.label}
                    </span>
                    {rawScore !== undefined && (
                      <span className="rounded bg-[#18191c] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#edeae1] border border-[#35373e]">
                        {rawScore}/100
                      </span>
                    )}
                  </div>
                </div>

                {ind.description && (
                  <p className="text-xs text-[#9e9c96] leading-relaxed">{ind.description}</p>
                )}

                {ind.advisoryDisclaimer && (
                  <p className="text-[10px] text-[#71706b] italic border-t border-[#35373e]/40 pt-1">
                    {ind.advisoryDisclaimer}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { VocalIndicator, SpeechEmotionProfile, DISCLAIMER_ADVISORY_VOCAL_METRICS } from '@/types';
import { Mic, AlertTriangle, Activity, HeartPulse, Gauge, ShieldAlert } from 'lucide-react';

interface VocalIndicatorCardProps {
  indicators: VocalIndicator[];
  emotionProfile?: SpeechEmotionProfile;
}

export function VocalIndicatorCard({ indicators, emotionProfile }: VocalIndicatorCardProps) {
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'fear':
      case 'distress':
        return 'text-[#d96f68] bg-[#401311] border-[#b84a44]/50';
      case 'anger':
        return 'text-[#ffb964] bg-[#422006] border-[#ffb964]/40';
      case 'nervousness':
        return 'text-[#e5c07b] bg-[#292a2c] border-[#e5c07b]/30';
      case 'calm':
      case 'neutral':
        return 'text-[#8a9a5b] bg-[#1a2e1f] border-[#5a8264]/40';
      default:
        return 'text-[#edeae1] bg-[#23252a] border-[#35373e]';
    }
  };

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

      {/* Primary Emotion Breakdown If Present */}
      {emotionProfile && (
        <div className="space-y-3 rounded border border-[#35373e] bg-[#23252a] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#edeae1]">Caller Emotional State:</span>
            <span
              className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase border ${getEmotionColor(
                emotionProfile.primaryEmotion
              )}`}
            >
              Primary: {emotionProfile.primaryEmotion}
            </span>
          </div>

          {/* Progress Bars for Fear, Distress, Anger, Nervousness, Calm */}
          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#d96f68]">Fear & Panic</span>
                <span className="text-[#edeae1]">{Math.round(emotionProfile.emotions.fear * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d96f68] transition-all"
                  style={{ width: `${Math.min(100, emotionProfile.emotions.fear * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#ffb964]">Distress / Helplessness</span>
                <span className="text-[#edeae1]">{Math.round(emotionProfile.emotions.distress * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ffb964] transition-all"
                  style={{ width: `${Math.min(100, emotionProfile.emotions.distress * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#e5c07b]">Nervousness & Agitation</span>
                <span className="text-[#edeae1]">{Math.round(emotionProfile.emotions.nervousness * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e5c07b] transition-all"
                  style={{ width: `${Math.min(100, emotionProfile.emotions.nervousness * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#8a9a5b]">Calm / Composure</span>
                <span className="text-[#edeae1]">{Math.round(emotionProfile.emotions.calm * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#18191c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8a9a5b] transition-all"
                  style={{ width: `${Math.min(100, emotionProfile.emotions.calm * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Acoustic Telemetry Metrics */}
          {emotionProfile.acousticMetrics && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#35373e]/50 font-mono text-[10px]">
              {emotionProfile.acousticMetrics.pitchJitterHz && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Pitch Shift / Jitter:</span>
                  <p className="font-bold text-[#ffb964]">+{emotionProfile.acousticMetrics.pitchJitterHz} Hz</p>
                </div>
              )}
              {emotionProfile.acousticMetrics.speechRateWpm && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Speech Rate:</span>
                  <p className="font-bold text-[#edeae1]">{emotionProfile.acousticMetrics.speechRateWpm} WPM</p>
                </div>
              )}
              {emotionProfile.acousticMetrics.vocalTremorScore && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Vocal Tremor:</span>
                  <p className="font-bold text-[#d96f68]">{emotionProfile.acousticMetrics.vocalTremorScore}/100</p>
                </div>
              )}
              {emotionProfile.distressPeakTimestampSeconds && (
                <div className="rounded bg-[#18191c] p-1.5">
                  <span className="text-[#9e9c96]">Distress Peak:</span>
                  <p className="font-bold text-[#8a9a5b]">At {emotionProfile.distressPeakTimestampSeconds}s</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Acoustic Cues List */}
      <div className="flex flex-col gap-2">
        {indicators.length === 0 ? (
          <p className="text-xs text-[#9e9c96] italic p-2">
            No anomalous acoustic stress variance detected or feature in abstention.
          </p>
        ) : (
          indicators.map((ind) => (
            <div
              key={ind.id}
              className="rounded border border-[#35373e] bg-[#23252a] p-2.5 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#edeae1]">
                  {ind.title || ind.metricName || ind.type}
                </span>
                <span className="rounded bg-[#401311] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#d96f68] border border-[#b84a44]/40">
                  {ind.score || ind.metricValue || 0}/100
                </span>
              </div>
              <p className="text-xs text-[#9e9c96] leading-relaxed">{ind.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

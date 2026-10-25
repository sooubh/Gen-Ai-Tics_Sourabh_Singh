'use client';

import { EmergencyTrigger } from '@/types';
import { AlertOctagon, Check, X, Clock } from 'lucide-react';

interface TriggerListProps {
  triggers: EmergencyTrigger[];
  onConfirmTrigger?: (triggerId: string) => void;
  onDismissTrigger?: (triggerId: string) => void;
  onSeekToTrigger?: (seconds: number) => void;
}

export function TriggerList({
  triggers,
  onConfirmTrigger,
  onDismissTrigger,
  onSeekToTrigger,
}: TriggerListProps) {
  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3.5 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <AlertOctagon className="h-4 w-4 text-[#d96f68] flex-shrink-0" />
          <h3 className="text-sm font-semibold text-[#edeae1] truncate">Emergency & Threat Triggers</h3>
        </div>
        <span className="rounded bg-[#401311] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#d96f68] border border-[#b84a44]/40 tabular-nums whitespace-nowrap flex-shrink-0">
          {triggers.length} Flagged
        </span>
      </div>

      {/* Trigger Items Container */}
      <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto scroll-smooth pr-1">
        {triggers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[#9e9c96] border border-dashed border-[#35373e]/60 rounded-lg">
            <AlertOctagon className="h-6 w-6 text-[#71706b] mb-1.5 opacity-50" />
            <p className="text-xs font-medium text-[#edeae1]">No emergency triggers flagged in recording</p>
            <p className="text-[11px] text-[#71706b] mt-0.5 max-w-xs">
              Extortion ultimatums, panic cues, and high-threat language will be flagged here.
            </p>
          </div>
        ) : (
          triggers.map((trig) => {
            const isConfirmed = trig.verificationStatus === 'confirmed' || trig.status === 'confirmed';
            const isDismissed = trig.verificationStatus === 'dismissed' || trig.status === 'dismissed';
            const isCritical = trig.severity === 'critical';
            const evidenceStartTime = trig.evidence?.startTime ?? trig.timestamp ?? trig.timeSeconds ?? 0;

            return (
              <div
                key={trig.id}
                onClick={() => onSeekToTrigger && onSeekToTrigger(evidenceStartTime)}
                className={`flex flex-col gap-2 rounded-lg border p-3 transition-colors cursor-pointer hover:border-[#8a9a5b]/60 ${
                  isConfirmed
                    ? 'border-[#5a8264]/50 bg-[#1c1f1c]'
                    : isDismissed
                    ? 'border-[#35373e]/30 bg-[#18191c] opacity-60'
                    : isCritical
                    ? 'border-[#b84a44]/60 bg-[#401311]/20'
                    : 'border-[#ffb964]/40 bg-[#2a2418]/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                    <span
                      className={`font-mono text-xs font-bold break-words ${
                        isCritical ? 'text-[#d96f68]' : 'text-[#ffb964]'
                      }`}
                    >
                      {trig.title || trig.category || trig.type}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 ${
                        isCritical
                          ? 'border-[#b84a44]/50 bg-[#401311] text-[#d96f68]'
                          : 'border-[#ffb964]/40 bg-[#23252a] text-[#ffb964]'
                      }`}
                    >
                      {trig.severity}
                    </span>
                  </div>

                  {/* Context Tag (Negated, Historical, Hypothetical, Direct) */}
                  <span className="rounded bg-[#18191c] px-1.5 py-0.2 font-mono text-[9px] text-[#9e9c96] border border-[#35373e] flex-shrink-0 whitespace-nowrap">
                    CTX: {trig.context || trig.contextTag || 'direct'}
                  </span>
                </div>

                {/* Verbatim Quote */}
                <p className="text-xs italic text-[#edeae1] leading-relaxed border-l-2 border-[#b84a44] pl-2 my-0.5 break-words">
                  "{trig.quote}"
                </p>

                {/* Footer with Offset, Confidence and Review Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#35373e]/40 pt-1.5 text-[11px]">
                  <div className="flex items-center gap-2 font-mono text-[#9e9c96] tabular-nums">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeekToTrigger && onSeekToTrigger(evidenceStartTime);
                      }}
                      className="flex items-center gap-1 text-[#8a9a5b] hover:underline focus:outline-none"
                    >
                      <Clock className="h-3 w-3" />
                      <span>
                        {trig.timeOffset || `${Math.floor(evidenceStartTime / 60)}:${Math.floor(evidenceStartTime % 60).toString().padStart(2, '0')}`}
                      </span>
                    </button>
                    <span>•</span>
                    <span>Conf: {trig.confidence}%</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1 rounded bg-[#5a8264]/20 px-2 py-0.5 font-mono text-[10px] text-[#7ea886] border border-[#5a8264]/40 whitespace-nowrap">
                        <Check className="h-3 w-3 flex-shrink-0" />
                        Officer Confirmed
                      </span>
                    ) : isDismissed ? (
                      <span className="rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#71706b] whitespace-nowrap">
                        Dismissed
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onConfirmTrigger && onConfirmTrigger(trig.id)}
                          className="flex items-center gap-1 rounded bg-[#5a8264]/20 px-2 py-0.5 font-mono text-[10px] text-[#7ea886] hover:bg-[#5a8264]/30 border border-[#5a8264]/40 transition-colors focus:outline-none"
                        >
                          <Check className="h-3 w-3" />
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDismissTrigger && onDismissTrigger(trig.id)}
                          className="flex items-center gap-1 rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#9e9c96] hover:text-[#edeae1] border border-[#35373e] transition-colors focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                          <span>Dismiss</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

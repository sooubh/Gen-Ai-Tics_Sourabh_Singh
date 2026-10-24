'use client';

import React from 'react';
import { EmergencyTrigger } from '@/types';
import { AlertOctagon, Check, X, ShieldAlert, Clock } from 'lucide-react';

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
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-[#d96f68]" />
          <h3 className="text-sm font-semibold text-[#edeae1]">Emergency & Threat Triggers</h3>
        </div>
        <span className="rounded bg-[#401311] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#d96f68] border border-[#b84a44]/40">
          {triggers.length} Flagged
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
        {triggers.length === 0 ? (
          <p className="text-xs text-[#9e9c96] italic p-2">No active emergency triggers flagged.</p>
        ) : (
          triggers.map((trig) => {
            const isConfirmed = trig.verificationStatus === 'confirmed' || trig.status === 'confirmed';
            const isDismissed = trig.verificationStatus === 'dismissed' || trig.status === 'dismissed';
            const isCritical = trig.severity === 'critical';

            return (
              <div
                key={trig.id}
                className={`flex flex-col gap-2 rounded border p-3 transition-colors ${
                  isConfirmed
                    ? 'border-[#5a8264]/50 bg-[#1c1f1c]'
                    : isDismissed
                    ? 'border-[#35373e]/30 bg-[#18191c] opacity-60'
                    : isCritical
                    ? 'border-[#b84a44]/60 bg-[#401311]/20'
                    : 'border-[#ffb964]/40 bg-[#2a2418]/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isCritical ? 'text-[#d96f68]' : 'text-[#ffb964]'
                      }`}
                    >
                      {trig.title || trig.category || trig.type}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider border ${
                        isCritical
                          ? 'border-[#b84a44]/50 bg-[#401311] text-[#d96f68]'
                          : 'border-[#ffb964]/40 bg-[#23252a] text-[#ffb964]'
                      }`}
                    >
                      {trig.severity}
                    </span>
                  </div>

                  {/* Context Tag (Negated, Historical, Hypothetical, Direct) */}
                  <span className="rounded bg-[#18191c] px-1.5 py-0.2 font-mono text-[9px] text-[#9e9c96] border border-[#35373e]">
                    CTX: {trig.context || trig.contextTag || 'direct'}
                  </span>
                </div>

                {/* Verbatim Quote */}
                <p className="text-xs italic text-[#edeae1] leading-relaxed border-l-2 border-[#b84a44] pl-2 my-0.5">
                  "{trig.quote}"
                </p>

                {/* Footer with Offset, Confidence and Review Actions */}
                <div className="flex items-center justify-between border-t border-[#35373e]/40 pt-1.5 text-[11px]">
                  <div className="flex items-center gap-2 font-mono text-[#9e9c96]">
                    <button
                      onClick={() => onSeekToTrigger && onSeekToTrigger(trig.timestamp || trig.timeSeconds || 0)}
                      className="flex items-center gap-1 text-[#8a9a5b] hover:underline"
                    >
                      <Clock className="h-3 w-3" />
                      <span>
                        {trig.timeOffset || `${Math.floor((trig.timestamp || 0) / 60)}:${Math.floor((trig.timestamp || 0) % 60).toString().padStart(2, '0')}`}
                      </span>
                    </button>
                    <span>•</span>
                    <span>Conf: {trig.confidence}%</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1 rounded bg-[#5a8264]/20 px-2 py-0.5 font-mono text-[10px] text-[#7ea886] border border-[#5a8264]/40">
                        <Check className="h-3 w-3" />
                        Officer Confirmed
                      </span>
                    ) : isDismissed ? (
                      <span className="rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#71706b]">
                        Dismissed
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onConfirmTrigger && onConfirmTrigger(trig.id)}
                          className="flex items-center gap-1 rounded bg-[#5a8264]/20 px-2 py-0.5 font-mono text-[10px] text-[#7ea886] hover:bg-[#5a8264]/30 border border-[#5a8264]/40 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => onDismissTrigger && onDismissTrigger(trig.id)}
                          className="flex items-center gap-1 rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#9e9c96] hover:text-[#edeae1] border border-[#35373e] transition-colors"
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

'use client';

import { TimelineEvent } from '@/types';
import { Clock, Play } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
  onSeek?: (seconds: number) => void;
}

export function TimelineView({ events, onSeek }: TimelineViewProps) {
  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3.5 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-[#8a9a5b] flex-shrink-0" />
          <h3 className="text-sm font-semibold text-[#edeae1] truncate">Incident Timeline</h3>
        </div>
        <span className="rounded bg-[#23252a] px-1.5 py-0.5 font-mono text-[11px] text-[#8a9a5b] border border-[#35373e] tabular-nums whitespace-nowrap flex-shrink-0">
          {events.length} Events
        </span>
      </div>

      {/* Content */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-[#9e9c96] border border-dashed border-[#35373e]/60 rounded-lg">
          <Clock className="h-6 w-6 text-[#71706b] mb-1.5 opacity-50" />
          <p className="text-xs font-medium text-[#edeae1]">No timeline events detected in recording</p>
          <p className="text-[11px] text-[#71706b] mt-0.5 max-w-xs">
            Chronological incidents, status changes, and critical timestamps will be mapped here.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-3 pl-4 border-l border-[#35373e] ml-2 my-1 max-h-[300px] overflow-y-auto scroll-smooth pr-1">
          {events.map((evt) => {
            const isThreat = evt.category === 'threat' || evt.severity === 'critical';
            const numSeconds = typeof evt.timestamp === 'number' ? evt.timestamp : evt.timeSeconds || 0;

            return (
              <div key={evt.id} className="relative flex flex-col gap-1 text-xs group">
                {/* Node dot on vertical track */}
                <span
                  className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#18191c] ${
                    isThreat ? 'bg-[#d96f68]' : 'bg-[#8a9a5b]'
                  }`}
                />

                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-[#8a9a5b] tabular-nums flex-shrink-0">
                      [{evt.timeLabel || `${Math.floor(numSeconds / 60)}:${Math.floor(numSeconds % 60).toString().padStart(2, '0')}`}]
                    </span>
                    <span className="font-semibold text-[#edeae1] break-words">{evt.title}</span>
                  </div>

                  {onSeek && (
                    <button
                      type="button"
                      onClick={() => onSeek(numSeconds)}
                      className="flex items-center gap-1 font-mono text-[10px] text-[#8a9a5b] hover:underline opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto focus:outline-none"
                    >
                      <Play className="h-2.5 w-2.5 fill-current" />
                      <span>Seek</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#9e9c96] leading-relaxed break-words">{evt.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

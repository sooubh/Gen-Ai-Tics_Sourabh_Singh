'use client';

import React from 'react';
import { TimelineEvent } from '@/types';
import { GitCommit, Clock, Play } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
  onSeek?: (seconds: number) => void;
}

export function TimelineView({ events, onSeek }: TimelineViewProps) {
  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3.5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#8a9a5b]" />
          <h3 className="text-sm font-semibold text-[#edeae1]">Incident Timeline</h3>
        </div>
        <span className="rounded bg-[#23252a] px-1.5 py-0.5 font-mono text-[11px] text-[#8a9a5b] border border-[#35373e]">
          {events.length} Events
        </span>
      </div>

      <div className="relative flex flex-col gap-3 pl-4 border-l border-[#35373e] ml-2 my-1 max-h-[300px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-[#9e9c96] italic p-1">No timeline events indexed yet.</p>
        ) : (
          events.map((evt) => {
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#8a9a5b]">
                      [{evt.timeLabel || `${Math.floor(numSeconds / 60)}:${Math.floor(numSeconds % 60).toString().padStart(2, '0')}`}]
                    </span>
                    <span className="font-semibold text-[#edeae1]">{evt.title}</span>
                  </div>

                  {onSeek && (
                    <button
                      onClick={() => onSeek(numSeconds)}
                      className="flex items-center gap-1 font-mono text-[10px] text-[#8a9a5b] hover:underline opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-2.5 w-2.5 fill-current" />
                      <span>Seek</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#9e9c96] leading-relaxed">{evt.description}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

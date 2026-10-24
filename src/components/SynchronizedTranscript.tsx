'use client';

import React, { useState } from 'react';
import { TranscriptSegment } from '@/types';
import { Play, Edit2, Check, X, Subtitles, AlertCircle } from 'lucide-react';

interface SynchronizedTranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onEditSegment?: (segmentId: string, newText: string) => void;
}

export function SynchronizedTranscript({
  segments,
  currentTime,
  onSeek,
  onEditSegment,
}: SynchronizedTranscriptProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = (secs % 60).toFixed(3);
    return `${mins.toString().padStart(2, '0')}:${remSecs.padStart(6, '0')}`;
  };

  const startEdit = (seg: TranscriptSegment) => {
    setEditingId(seg.id);
    setEditText(seg.editedText || seg.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (id: string) => {
    if (onEditSegment && editText.trim()) {
      onEditSegment(id, editText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3.5 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
        <div className="flex items-center gap-2">
          <Subtitles className="h-4 w-4 text-[#8a9a5b]" />
          <h2 className="text-sm font-semibold text-[#edeae1]">Synchronized Forensic Transcript</h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#9e9c96]">
          <span className="rounded bg-[#23252a] px-1.5 py-0.5 text-[#edeae1] border border-[#35373e]">
            {segments.length} Utterances
          </span>
          <span>•</span>
          <span className="hidden sm:inline">Diarization: Conformer-XL (Strict)</span>
        </div>
      </div>

      {/* Segments List */}
      <div className="flex flex-col gap-2.5 max-h-[440px] overflow-y-auto pr-1">
        {segments.map((seg) => {
          const isActive = currentTime >= seg.startTime && currentTime <= seg.endTime;
          const isThreat = seg.isThreat;
          const isEditing = editingId === seg.id;

          return (
            <div
              key={seg.id}
              className={`group flex flex-col gap-1.5 rounded p-3 transition-colors border ${
                isThreat
                  ? 'border-l-2 border-l-[#b84a44] border-y-[#35373e] border-r-[#35373e] bg-[#23252a] shadow-sm'
                  : isActive
                  ? 'border-[#7d8c52] bg-[#1f2024]'
                  : 'border-[#35373e]/40 bg-[#1f2022] hover:border-[#35373e]'
              }`}
            >
              {/* Segment Metadata Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold border ${
                      isThreat
                        ? 'border-[#b84a44]/50 bg-[#401311] text-[#d96f68] flex items-center gap-1'
                        : seg.speakerRole === 'Suspect'
                        ? 'border-[#b84a44]/30 bg-[#292a2c] text-[#d96f68]'
                        : 'border-[#35373e] bg-[#292a2c] text-[#ffb964]'
                    }`}
                  >
                    {isThreat && <span className="h-1.5 w-1.5 rounded-full bg-[#d96f68]" />}
                    {typeof seg.speaker === 'string'
                      ? seg.speaker
                      : (seg.speaker?.provisionalLabel || seg.speaker?.speakerId || seg.speakerLabel || seg.speakerId || 'Speaker')}
                  </span>

                  <span className="font-mono text-[11px] text-[#9e9c96]">
                    {formatTime(seg.startTime)} → {formatTime(seg.endTime)}
                  </span>

                  <span className="rounded bg-[#0d0e10] px-1.5 py-0.5 font-mono text-[10px] text-[#8a9a5b] border border-[#35373e]/50">
                    Conf: {seg.confidence}%
                  </span>

                  {isThreat && (
                    <span className="rounded border border-[#b84a44]/40 bg-[#401311]/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#d96f68]">
                      {seg.threatLabel || seg.threatType || 'EXTORTION ULTIMATUM'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(seg)}
                      className="rounded p-1 text-[#71706b] hover:bg-[#23252a] hover:text-[#edeae1] opacity-60 group-hover:opacity-100 transition-opacity"
                      title="Correct Transcript"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onSeek(seg.startTime)}
                    className="flex items-center gap-1 font-mono text-[11px] text-[#8a9a5b] hover:underline opacity-80 group-hover:opacity-100 transition-opacity ml-1"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{formatTime(seg.startTime).slice(0, 5)}</span>
                  </button>
                </div>
              </div>

              {/* Text content or edit input */}
              {isEditing ? (
                <div className="mt-1 flex flex-col gap-1.5">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded border border-[#7d8c52] bg-[#161719] p-2 text-xs text-[#edeae1] focus:outline-none"
                    rows={2}
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 rounded bg-[#23252a] px-2 py-1 text-[11px] text-[#9e9c96] hover:text-[#edeae1] border border-[#35373e]"
                    >
                      <X className="h-3 w-3" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={() => saveEdit(seg.id)}
                      className="flex items-center gap-1 rounded bg-[#7d8c52] px-2 py-1 text-[11px] font-semibold text-[#161f00] hover:bg-[#8a9a5b]"
                    >
                      <Check className="h-3 w-3" />
                      <span>Save Correction</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-0.5">
                  <p className="text-sm text-[#edeae1] leading-relaxed pl-1">
                    {seg.editedText ? (
                      <>
                        <span>{seg.editedText}</span>
                        <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-[#5a8264]/20 px-1 py-0.2 font-mono text-[9px] text-[#7ea886] border border-[#5a8264]/30">
                          Officer Corrected ({seg.editedBy || 'Det. Jenkins'})
                        </span>
                      </>
                    ) : (
                      seg.text
                    )}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

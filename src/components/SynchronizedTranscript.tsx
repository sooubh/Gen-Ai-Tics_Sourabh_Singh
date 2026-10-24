'use client';

import React, { useState, useMemo } from 'react';
import { TranscriptSegment, VocalIndicator } from '@/types';
import {
  Play,
  Edit2,
  Check,
  X,
  Subtitles,
  Tag,
  Search,
  Plus,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface SynchronizedTranscriptProps {
  segments: TranscriptSegment[];
  cues?: VocalIndicator[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onEditSegment?: (segmentId: string, newText: string) => void;
}

const DEFAULT_KEYWORDS = [
  'arrest',
  'cbi',
  'police',
  'money',
  'transfer',
  'otp',
  'urgent',
  'raid',
  'jail',
  'account',
  'threat',
  'rtgs',
];

export function SynchronizedTranscript({
  segments,
  cues = [],
  currentTime,
  onSeek,
  onEditSegment,
}: SynchronizedTranscriptProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  // Configurable keywords state
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');
  const [highlightsEnabled, setHighlightsEnabled] = useState<boolean>(true);

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

  const handleAddKeyword = () => {
    const trimmed = newKeywordInput.trim().toLowerCase();
    if (!trimmed) return;

    // Handle comma-separated input
    const parts = trimmed
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const updated = [...keywords];
    for (const part of parts) {
      if (!updated.includes(part)) {
        updated.push(part);
      }
    }

    setKeywords(updated);
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove));
  };

  const handleResetKeywords = () => {
    setKeywords(DEFAULT_KEYWORDS);
  };

  const handleClearKeywords = () => {
    setKeywords([]);
  };

  // Compile regex pattern for active keywords
  const keywordRegex = useMemo(() => {
    if (!highlightsEnabled || keywords.length === 0) return null;
    const escaped = keywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    return new RegExp(`(${escaped})`, 'gi');
  }, [keywords, highlightsEnabled]);

  // Compute total keyword match count across all transcript utterances
  const totalMatchesCount = useMemo(() => {
    if (!keywordRegex) return 0;
    let count = 0;
    for (const seg of segments) {
      const textToScan = seg.editedText || seg.text;
      const matches = textToScan.match(keywordRegex);
      if (matches) count += matches.length;
    }
    return count;
  }, [segments, keywordRegex]);

  // Helper to highlight matching keywords in text
  const renderHighlightedText = (text: string) => {
    if (!keywordRegex) return text;

    const parts = text.split(keywordRegex);
    return parts.map((part, index) => {
      const isMatch = keywords.some((k) => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark
            key={index}
            className="rounded bg-[#ffb964]/25 px-1 py-0.5 font-semibold text-[#ffb964] border border-[#ffb964]/40"
            title="Highlighted Keyword"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Helper to find cues overlapping with this segment's timestamp window
  const getOverlappingCues = (segStartTime: number, segEndTime: number): VocalIndicator[] => {
    if (!cues || cues.length === 0) return [];
    return cues.filter((cue) => {
      const cueStart = cue.startTime ?? 0;
      const cueEnd = cue.endTime ?? cueStart + 1.5;
      return (
        (cueStart >= segStartTime && cueStart <= segEndTime) ||
        (cueEnd >= segStartTime && cueEnd <= segEndTime) ||
        (cueStart <= segStartTime && cueEnd >= segEndTime)
      );
    });
  };

  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3.5 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#35373e]/40 pb-2">
        <div className="flex items-center gap-2">
          <Subtitles className="h-4 w-4 text-[#8a9a5b]" />
          <h2 className="text-sm font-semibold text-[#edeae1]">
            Timestamped Synchronized Transcript
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#9e9c96]">
          <span className="rounded bg-[#23252a] px-1.5 py-0.5 text-[#edeae1] border border-[#35373e]">
            {segments.length} Utterances
          </span>
          {highlightsEnabled && totalMatchesCount > 0 && (
            <span className="rounded bg-[#422006] px-1.5 py-0.5 text-[#ffb964] border border-[#ffb964]/40 flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3" />
              {totalMatchesCount} Keyword Matches
            </span>
          )}
        </div>
      </div>

      {/* Configurable Keyword Highlighter Bar */}
      <div className="rounded border border-[#35373e]/70 bg-[#121315] p-2.5 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#edeae1] font-medium">
            <Tag className="h-3.5 w-3.5 text-[#ffb964]" />
            <span>Configurable Keyword Highlighting:</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setHighlightsEnabled(!highlightsEnabled)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                highlightsEnabled
                  ? 'border-[#7d8c52] bg-[#7d8c52]/20 text-[#8a9a5b]'
                  : 'border-[#35373e] bg-[#23252a] text-[#71706b]'
              }`}
            >
              {highlightsEnabled ? 'Highlights ON' : 'Highlights OFF'}
            </button>
            <button
              type="button"
              onClick={handleResetKeywords}
              className="text-[#9e9c96] hover:text-[#edeae1] underline flex items-center gap-1"
              title="Reset to default cybercrime triage keywords"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleClearKeywords}
              className="text-[#9e9c96] hover:text-[#edeae1] underline"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Keyword Pills List */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[26px]">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 rounded bg-[#2a1a05] px-2 py-0.5 font-mono text-[11px] font-medium text-[#ffb964] border border-[#ffb964]/40"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(kw)}
                className="text-[#ffb964]/70 hover:text-[#ffb964] p-0.5 rounded"
                title={`Remove keyword "${kw}"`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}

          {keywords.length === 0 && (
            <span className="text-[11px] text-[#71706b] italic">
              No keywords configured. Type below to add keywords to highlight.
            </span>
          )}
        </div>

        {/* Add Keyword Input */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#35373e]/40">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-[#71706b]" />
            <input
              type="text"
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              placeholder="Add keyword or comma-separated terms (e.g. extortion, police, bitcoin)..."
              className="w-full rounded border border-[#35373e] bg-[#18191c] pl-7 pr-3 py-1 text-xs text-[#edeae1] placeholder-[#71706b] focus:border-[#7d8c52] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddKeyword}
            className="flex items-center gap-1 rounded bg-[#23252a] px-2.5 py-1 text-xs font-mono font-medium text-[#edeae1] border border-[#35373e] hover:border-[#7d8c52] hover:text-[#8a9a5b] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Segments List */}
      <div className="flex flex-col gap-2.5 max-h-[440px] overflow-y-auto pr-1">
        {segments.map((seg) => {
          const isActive = currentTime >= seg.startTime && currentTime <= seg.endTime;
          const isThreat = seg.isThreat;
          const isEditing = editingId === seg.id;
          const overlappingCues = getOverlappingCues(seg.startTime, seg.endTime);

          return (
            <div
              key={seg.id}
              onClick={() => !isEditing && onSeek(seg.startTime)}
              className={`group flex flex-col gap-1.5 rounded p-3 transition-colors border cursor-pointer hover:border-[#8a9a5b]/60 ${
                isThreat
                  ? 'border-l-2 border-l-[#b84a44] border-y-[#35373e] border-r-[#35373e] bg-[#23252a] shadow-sm'
                  : isActive
                  ? 'border-[#7d8c52] bg-[#1f2024] shadow-[0_0_10px_rgba(125,140,82,0.15)]'
                  : 'border-[#35373e]/40 bg-[#1f2022] hover:border-[#35373e]'
              }`}
            >
              {/* Segment Metadata Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-wrap items-center gap-2">
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
                      : (seg.speaker?.provisionalLabel ||
                          seg.speaker?.speakerId ||
                          seg.speakerLabel ||
                          seg.speakerId ||
                          'Speaker')}
                  </span>

                  {/* Timestamp with Seek Action */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(seg.startTime);
                    }}
                    className="font-mono text-[11px] text-[#9e9c96] hover:text-[#8a9a5b] hover:underline cursor-pointer flex items-center gap-1"
                    title={`Seek audio to ${formatTime(seg.startTime)}`}
                  >
                    <Play className="h-2.5 w-2.5 fill-current text-[#8a9a5b]" />
                    <span>
                      {formatTime(seg.startTime)} → {formatTime(seg.endTime)}
                    </span>
                  </span>

                  <span className="rounded bg-[#0d0e10] px-1.5 py-0.5 font-mono text-[10px] text-[#8a9a5b] border border-[#35373e]/50">
                    Conf: {seg.confidence}%
                  </span>

                  {isThreat && (
                    <span className="rounded border border-[#b84a44]/40 bg-[#401311]/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#d96f68]">
                      {seg.threatLabel || seg.threatType || 'EXTORTION ULTIMATUM'}
                    </span>
                  )}

                  {/* Overlapping Acoustic / Emotion Cues */}
                  {overlappingCues.map((cue, idx) => (
                    <span
                      key={cue.id || idx}
                      className="rounded border border-[#ffb964]/40 bg-[#422006]/60 px-1.5 py-0.5 font-mono text-[10px] text-[#ffb964] flex items-center gap-1"
                      title={cue.description || 'Acoustic emotion marker detected by model'}
                    >
                      <Volume2 className="h-2.5 w-2.5 text-[#ffb964]" />
                      <span>Cue: {cue.type?.replace(/_/g, ' ') || 'Vocal Distress'}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(seg)}
                      className="rounded p-1 text-[#71706b] hover:bg-[#23252a] hover:text-[#edeae1] opacity-60 group-hover:opacity-100 transition-opacity"
                      title="Correct Transcript"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSeek(seg.startTime)}
                    className="flex items-center gap-1 font-mono text-[11px] text-[#8a9a5b] hover:underline opacity-80 group-hover:opacity-100 transition-opacity ml-1"
                    title="Seek audio to utterance start"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{formatTime(seg.startTime).slice(0, 5)}</span>
                  </button>
                </div>
              </div>

              {/* Text content with keyword highlighting or edit input */}
              {isEditing ? (
                <div className="mt-1 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                        <span>{renderHighlightedText(seg.editedText)}</span>
                        <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-[#5a8264]/20 px-1 py-0.2 font-mono text-[9px] text-[#7ea886] border border-[#5a8264]/30">
                          Officer Corrected ({seg.editedBy || 'Det. Jenkins'})
                        </span>
                      </>
                    ) : (
                      renderHighlightedText(seg.text)
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

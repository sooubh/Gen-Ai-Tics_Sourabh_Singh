'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Activity,
} from 'lucide-react';

interface AudioPlayerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSeek: (seconds: number) => void;
  filename?: string;
  format?: string;
  threatTimestamp?: number;
  audioUrl?: string;
}

export function AudioPlayer({
  currentTime,
  duration = 1125, // default 18:45
  isPlaying,
  onPlayToggle,
  onSeek,
  filename = 'RECORDING_VOIP_CALL_0892.wav',
  format = '48kHz / 24-bit PCM • 2 Channels',
  threatTimestamp = 252.0, // 04:12
  audioUrl,
}: AudioPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoopingCue, setIsLoopingCue] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Format time as MM:SS.mmm
  const formatTimeFull = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * duration;
    onSeek(targetTime);
  };

  const handleRewind5 = () => {
    onSeek(Math.max(0, currentTime - 5));
  };

  const handleForward5 = () => {
    onSeek(Math.min(duration, currentTime + 5));
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const threatPercent = duration > 0 ? (threatTimestamp / duration) * 100 : 22.4;

  return (
    <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3 shadow-sm flex flex-col gap-2.5">
      {/* Hidden audio element if real stream is available */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) onSeek(audioRef.current.currentTime);
          }}
          onEnded={onPlayToggle}
        />
      )}

      {/* Stream Header */}
      <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-1 text-xs text-[#9e9c96]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#8a9a5b]" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#edeae1] font-semibold">
            Forensic Audio Stream
          </span>
          <span className="rounded bg-[#23252a] px-1.5 py-0.5 font-mono text-[10px] text-[#9e9c96] border border-[#35373e]">
            {filename}
          </span>
          <span className="hidden font-mono text-[10px] text-[#71706b] sm:inline">
            {format}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-semibold text-[#8a9a5b]">{formatTimeFull(currentTime)}</span>
          <span className="text-[#71706b]">/</span>
          <span className="text-[#9e9c96]">{formatTimeFull(duration)}</span>
        </div>
      </div>

      {/* Interactive Waveform Timeline */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        className="relative w-full cursor-pointer select-none rounded border border-[#35373e] bg-[#0d0e10] p-2 overflow-hidden flex flex-col gap-1"
      >
        {/* Time ruler ticks */}
        <div className="flex items-center justify-between border-b border-[#35373e]/30 pb-0.5 font-mono text-[10px] text-[#71706b]">
          <span>00:00</span>
          <span>03:00</span>
          <span className="font-semibold text-[#8a9a5b]">
            {formatTimeFull(currentTime).slice(0, 5)} [CUE]
          </span>
          <span>06:00</span>
          <span>09:00</span>
          <span>12:00</span>
          <span>15:00</span>
          <span>{formatTimeFull(duration).slice(0, 5)}</span>
        </div>

        {/* Waveform SVG Display */}
        <div className="relative h-20 w-full flex items-center justify-center">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 80">
            <defs>
              <linearGradient id="proWaveWarm" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#7d8c52" stopOpacity="0.55" />
                <stop offset={`${threatPercent - 1}%`} stopColor="#7d8c52" stopOpacity="0.55" />
                <stop offset={`${threatPercent}%`} stopColor="#b84a44" stopOpacity="0.95" />
                <stop offset={`${threatPercent + 3}%`} stopColor="#b84a44" stopOpacity="0.95" />
                <stop offset={`${threatPercent + 4}%`} stopColor="#7d8c52" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#7d8c52" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Grid background lines */}
            <line x1="0" x2="1000" y1="20" y2="20" stroke="#2b2d32" strokeDasharray="2,4" strokeWidth="0.5" />
            <line x1="0" x2="1000" y1="40" y2="40" stroke="#2b2d32" strokeWidth="0.8" />
            <line x1="0" x2="1000" y1="60" y2="60" stroke="#2b2d32" strokeDasharray="2,4" strokeWidth="0.5" />

            {/* Threat zone region highlight */}
            <rect
              x={`${threatPercent * 10}`}
              y="0"
              width="35"
              height="80"
              fill="#b84a44"
              fillOpacity="0.18"
            />

            {/* Waveform dual-channel RMS paths */}
            <path
              d="M 0,40 Q 15,28 30,40 T 60,40 T 90,32 T 120,40 T 150,22 T 180,52 T 210,40 T 225,8 T 232,72 T 240,12 T 248,68 T 255,18 T 262,58 T 275,40 T 310,34 T 350,45 T 390,32 T 430,46 T 470,36 T 510,44 T 550,30 T 600,48 T 650,35 T 700,44 T 750,32 T 800,46 T 850,34 T 900,44 T 950,38 T 1000,40"
              fill="none"
              stroke="url(#proWaveWarm)"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M 0,40 Q 15,35 30,40 T 60,40 T 90,36 T 120,40 T 150,30 T 180,45 T 210,40 T 225,18 T 232,60 T 240,22 T 248,58 T 255,26 T 262,52 T 275,40 T 310,36 T 350,42 T 390,35 T 430,44 T 470,38 T 510,42 T 550,34 T 600,44 T 650,38 T 700,42 T 750,36 T 800,43 T 850,36 T 900,42 T 950,39 T 1000,40"
              fill="none"
              opacity="0.6"
              stroke="#edeae1"
              strokeWidth="1"
            />
          </svg>

          {/* Precision Scrubber Needle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#8a9a5b] pointer-events-none z-20 flex flex-col items-center"
            style={{ left: `${currentPercent}%` }}
          >
            <div className="h-1.5 w-2 bg-[#8a9a5b] rounded-b-xs" />
            <div className="mt-auto h-1.5 w-2 bg-[#8a9a5b] rounded-t-xs" />
          </div>

          {/* Threat Annotation Badge */}
          <div
            className="absolute top-1.5 z-10 flex items-center gap-1 rounded border border-[#b84a44]/80 bg-[#0d0e10]/95 px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#d96f68] shadow-sm"
            style={{ left: `${threatPercent}%` }}
          >
            <span className="h-1 w-1 rounded-full bg-[#d96f68] animate-pulse" />
            <span>THREAT 04:12</span>
          </div>
        </div>
      </div>

      {/* Transport Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSeek(238.11)}
            className="rounded border border-[#35373e] bg-[#23252a] p-1.5 text-[#edeae1] hover:bg-[#2d2f36] transition-colors"
            title="Previous Segment (03:58)"
          >
            <SkipBack className="h-3.5 w-3.5 text-[#9e9c96]" />
          </button>
          <button
            onClick={handleRewind5}
            className="rounded border border-[#35373e] bg-[#23252a] p-1.5 text-[#edeae1] hover:bg-[#2d2f36] transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#9e9c96]" />
          </button>
          <button
            onClick={onPlayToggle}
            className="flex items-center gap-1.5 rounded bg-[#7d8c52] px-3 py-1.5 text-xs font-semibold text-[#161f00] hover:bg-[#8a9a5b] shadow-sm transition-all"
            title={isPlaying ? 'Pause Audio' : 'Play Audio'}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span className="font-mono">{formatTimeFull(currentTime).slice(0, 5)}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span className="font-mono">{formatTimeFull(currentTime).slice(0, 5)}</span>
              </>
            )}
          </button>
          <button
            onClick={handleForward5}
            className="rounded border border-[#35373e] bg-[#23252a] p-1.5 text-[#edeae1] hover:bg-[#2d2f36] transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="h-3.5 w-3.5 text-[#9e9c96]" />
          </button>
          <button
            onClick={() => onSeek(267.1)}
            className="rounded border border-[#35373e] bg-[#23252a] p-1.5 text-[#edeae1] hover:bg-[#2d2f36] transition-colors"
            title="Next Segment (04:27)"
          >
            <SkipForward className="h-3.5 w-3.5 text-[#9e9c96]" />
          </button>

          <div className="mx-1 h-4 w-px bg-[#35373e]" />

          <button
            onClick={() => setIsLoopingCue(!isLoopingCue)}
            className={`flex items-center gap-1 rounded border px-2 py-1 font-mono text-[11px] transition-colors ${
              isLoopingCue
                ? 'border-[#7d8c52] bg-[#7d8c52]/20 text-[#8a9a5b]'
                : 'border-[#35373e] bg-[#23252a] text-[#9e9c96] hover:bg-[#2d2f36]'
            }`}
          >
            <Repeat className="h-3 w-3 text-[#8a9a5b]" />
            <span>Loop CUE</span>
          </button>
        </div>

        {/* Speed & Volume */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 rounded border border-[#35373e] bg-[#0d0e10] p-0.5 font-mono text-[11px]">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  playbackRate === speed
                    ? 'border border-[#35373e] bg-[#23252a] font-bold text-[#8a9a5b]'
                    : 'text-[#71706b] hover:text-[#edeae1]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[#9e9c96]">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="hover:text-[#8a9a5b] transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const newVol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setVolume(newVol);
                setIsMuted(false);
              }}
              className="h-1 w-14 cursor-pointer overflow-hidden rounded-full bg-[#292a2c]"
            >
              <div
                className="h-full bg-[#8a9a5b]"
                style={{ width: isMuted ? '0%' : `${volume * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[#71706b]">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

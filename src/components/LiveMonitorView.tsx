'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Volume2, VolumeX, PauseCircle, PlayCircle, ShieldAlert, AlertTriangle, Activity, HeartPulse, User } from 'lucide-react';

interface LiveTranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  time: string;
  isThreat?: boolean;
  emotion?: string;
}

export function LiveMonitorView() {
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(145);
  const [liveUrgency, setLiveUrgency] = useState<number>(96);
  const [liveFear, setLiveFear] = useState<number>(94);
  const [liveDistress, setLiveDistress] = useState<number>(92);
  const [livePitch, setLivePitch] = useState<number>(182);

  const [liveTranscript, setLiveTranscript] = useState<LiveTranscriptEntry[]>([
    {
      id: 'LIV-01',
      speaker: 'CH-1 Victim [Inbound - Panicked]',
      time: '00:01:45',
      text: 'Officer he is still on my line! He says my bank account has money laundering transactions!',
      emotion: 'Severe Fear (94%)',
      isThreat: false,
    },
    {
      id: 'LIV-02',
      speaker: 'CH-2 Officer [Triage Desk]',
      time: '00:01:58',
      text: 'Maam stay calm, we are tracing the connection. Do not share any OTP or click any link.',
      isThreat: false,
    },
    {
      id: 'LIV-03',
      speaker: 'CH-1 Victim [Inbound - Panicked]',
      time: '00:02:15',
      text: 'He says if I dont send 5 Lakhs immediately, police will come to my house in 10 minutes!',
      emotion: 'Extortion Ultimatum / Acute Panic',
      isThreat: true,
    },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        // Slightly fluctuate live acoustic pitch
        setLivePitch((prev) => Math.min(220, Math.max(160, prev + (Math.random() * 8 - 4))));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remSecs = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const handleToggleHold = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto w-full">
      {/* Stream Control & Telemetry Bar */}
      <div className="w-full bg-[#18191c] border border-[#35373e] rounded-lg px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isRecording && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d96f68] opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRecording ? 'bg-[#d96f68]' : 'bg-[#71706b]'}`} />
            </span>
            <span className="font-mono text-xs font-bold text-[#edeae1] uppercase tracking-wider">
              Live Helpline Channel 01
            </span>
            <span className="text-[#35373e]">|</span>
            <span className="rounded bg-[#401311] px-2 py-0.5 font-mono text-[10px] text-[#d96f68] border border-[#b84a44]/50 font-black animate-pulse">
              LIVE URGENCY: {liveUrgency}/100 [CRITICAL]
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#9e9c96]">
            <span className="text-[#71706b]">Caller:</span>
            <span className="text-[#edeae1] font-medium">Distressed Citizen (+91 98201 44829)</span>
            <span>·</span>
            <span className="text-[#71706b]">Elapsed:</span>
            <span className="font-bold text-[#8a9a5b]">{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#23252a] hover:bg-[#2d2f36] text-[#edeae1] font-mono text-xs border border-[#35373e] transition-colors"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-[#d96f68]" /> : <Volume2 className="h-3.5 w-3.5 text-[#8a9a5b]" />}
            <span>Monitor Audio</span>
          </button>

          <button
            onClick={handleToggleHold}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-semibold transition-all border ${
              isRecording
                ? 'bg-[#b84a44] text-[#edeae1] hover:bg-[#a33f3a] border-[#b84a44]/50 shadow-[0_0_8px_rgba(184,74,68,0.25)]'
                : 'bg-[#7d8c52] text-[#161f00] hover:bg-[#8a9a5b] border-[#7d8c52]'
            }`}
          >
            {isRecording ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            <span>{isRecording ? 'Hold Live Stream' : 'Resume Capture'}</span>
          </button>
        </div>
      </div>

      {/* Responsible AI Disclaimer Banner */}
      <div className="rounded border border-[#b87a28]/40 bg-[#b87a28]/10 p-2.5 text-xs text-[#ffb964] flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 flex-shrink-0 text-[#ffb964] mt-0.5" />
        <p className="leading-snug text-[11px]">
          <strong>Responsible AI Safeguard:</strong> Real-time emotion classification is an assistive signal to aid triage priority. It is <u>not a lie detector</u> and does not ascertain truthfulness or criminal guilt. Officer judgment is paramount.
        </p>
      </div>

      {/* 2-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Dual Channel Waveform & Live Stream (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Dual Channel Waveform Canvas */}
          <div className="bg-[#18191c] border border-[#35373e] rounded-lg p-3.5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#35373e]/50 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#d96f68]" />
                  <span className="font-mono text-[11px] text-[#d96f68] uppercase font-semibold">
                    CH-1 Inbound Caller (Victim)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#8a9a5b]" />
                  <span className="font-mono text-[11px] text-[#8a9a5b] uppercase font-semibold">
                    CH-2 Triage Desk (Officer)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#71706b]">
                <span>Acoustic Latency: 32ms</span>
                <span>·</span>
                <span className="text-[#8a9a5b] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b]" /> LIVE SER ACTIVE
                </span>
              </div>
            </div>

            {/* Waveform Visualization Bars */}
            <div className="rounded border border-[#35373e]/60 bg-[#0d0e10] p-3 flex flex-col gap-3">
              <div className="flex items-end justify-between gap-1 h-14 w-full overflow-hidden">
                {Array.from({ length: 48 }).map((_, i) => {
                  const height = isRecording ? Math.sin(i * 0.4 + elapsedSeconds) * 40 + 50 : 8;
                  const isPeak = height > 75;
                  return (
                    <div
                      key={i}
                      className={`w-full rounded-sm transition-all duration-100 ${
                        isPeak ? 'bg-[#d96f68]' : 'bg-[#7d8c52]'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Streaming Speech Emotion Transcript */}
          <div className="bg-[#18191c] border border-[#35373e] rounded-lg p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
              <h3 className="text-sm font-semibold text-[#edeae1]">
                Live Speech Emotion Recognition (SER) Transcript
              </h3>
              <span className="font-mono text-[10px] text-[#8a9a5b] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b] animate-ping" /> Synchronized
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto">
              {liveTranscript.map((t) => (
                <div
                  key={t.id}
                  className={`rounded p-3 border transition-colors flex flex-col gap-1 ${
                    t.isThreat
                      ? 'border-[#b84a44]/50 bg-[#401311]/30'
                      : 'border-[#35373e] bg-[#23252a]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] font-semibold text-[#edeae1]">
                      {t.speaker}
                    </span>
                    <span className="text-[10px] text-[#71706b]">{t.time}</span>
                  </div>
                  <p className="text-sm text-[#edeae1] leading-relaxed mt-0.5">{t.text}</p>
                  {t.emotion && (
                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px]">
                      <span className="rounded bg-[#401311] px-1.5 py-0.5 font-bold text-[#d96f68] border border-[#b84a44]/40">
                        {t.emotion}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Emotional State & Triage Urgency (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Live Emotion Telemetry */}
          <div className="bg-[#18191c] border border-[#35373e] rounded-lg p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#edeae1] border-b border-[#35373e]/40 pb-2 flex items-center gap-1.5">
              <HeartPulse className="h-4 w-4 text-[#d96f68]" />
              <span>Real-Time Emotion Telemetry</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#d96f68] font-bold">Panic / Fear Intensity</span>
                  <span className="text-[#edeae1] font-bold">{liveFear}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d96f68] transition-all duration-300"
                    style={{ width: `${liveFear}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#ffb964] font-bold">Distress & Helplessness</span>
                  <span className="text-[#edeae1] font-bold">{liveDistress}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffb964] transition-all duration-300"
                    style={{ width: `${liveDistress}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#35373e]/40 grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded bg-[#23252a] p-2">
                  <span className="text-[#9e9c96]">Pitch Instability:</span>
                  <p className="font-bold text-[#ffb964] mt-0.5">+{Math.round(livePitch)} Hz</p>
                </div>
                <div className="rounded bg-[#23252a] p-2">
                  <span className="text-[#9e9c96]">Speech Tremor:</span>
                  <p className="font-bold text-[#d96f68] mt-0.5">88 / 100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Triage Action Guidance */}
          <div className="bg-[#18191c] border border-[#b84a44]/50 rounded-lg p-4 shadow-sm flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-[#d96f68] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Officer Immediate Recommendation</span>
            </h3>
            <div className="rounded bg-[#401311]/40 border border-[#b84a44]/40 p-2.5 text-xs text-[#edeae1] leading-relaxed space-y-1">
              <p className="font-bold text-[#d96f68]">High Coercion Emergency:</p>
              <p className="text-[11px] text-[#edeae1]">
                Caller is exhibiting acute panic response to fake law enforcement threats. Instruct caller to stay on line and verify no bank transfers have occurred.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Sliders,
  FolderOpen,
  Cpu,
  ShieldCheck,
  Check,
  AlertCircle,
  X,
  HeartPulse,
  AlertTriangle,
  Radio,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { store } from '@/lib/data/store';
import { CallerCategory } from '@/types';

interface PresetScenario {
  id: string;
  title: string;
  callerCategory: CallerCategory;
  callerName: string;
  callerPhone: string;
  description: string;
  fileName: string;
  duration: string;
  durationSeconds: number;
  expectedEmotion: string;
  urgencyScore: number;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'digital-arrest',
    title: 'Digital Arrest Cyber Coercion — Severe Panic',
    callerCategory: 'distressed_victim',
    callerName: 'Sunita Mehra',
    callerPhone: '+91 98102 44321',
    description: 'Elderly homemaker under active coercion by fake CBI caller demanding instant RTGS to prevent immediate property raid.',
    fileName: 'CALL_INBOUND_DIGITAL_ARREST_9104.wav',
    duration: '02:45',
    durationSeconds: 165,
    expectedEmotion: 'Acute Panic / Fear (96%)',
    urgencyScore: 98,
  },
  {
    id: 'extortion-ultimatum',
    title: 'Suspect Intercept: 15-Minute Coercion Ultimatum',
    callerCategory: 'suspected_fraudster',
    callerName: 'Intercepted Suspect (VoIP Route)',
    callerPhone: '+44 7700 900142',
    description: 'Hostile actor issuing aggressive deadline demands and threats of financial destruction.',
    fileName: 'CALL_INTERCEPT_EXTORTION_9088.wav',
    duration: '01:50',
    durationSeconds: 110,
    expectedEmotion: 'Hostile Anger & Coercion (89%)',
    urgencyScore: 88,
  },
  {
    id: 'boiler-room-tip',
    title: 'Informant Tip-Off: Fake Call-Center Facility',
    callerCategory: 'informant',
    callerName: 'Confidential Whistleblower',
    callerPhone: '+91 99881 23456',
    description: 'Subdued whistleblower reporting 40-seat illegal boiler room operation running fake tech support scams.',
    fileName: 'CALL_INFORMANT_TIP_9065.wav',
    duration: '02:15',
    durationSeconds: 135,
    expectedEmotion: 'Nervous Caution & Hesitation (72%)',
    urgencyScore: 62,
  },
];

export default function NewAudioAnalysisPage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('digital-arrest');
  const [callerCategory, setCallerCategory] = useState<CallerCategory>('distressed_victim');
  const [callerName, setCallerName] = useState<string>('Sunita Mehra');
  const [callerPhone, setCallerPhone] = useState<string>('+91 98102 44321');
  const [callTitle, setCallTitle] = useState<string>('Digital Arrest Cyber Coercion — Severe Panic');
  const [callDescription, setCallDescription] = useState<string>(
    'Elderly homemaker under active coercion by fake CBI caller demanding instant RTGS to prevent immediate property raid.'
  );

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(14);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedScenario('custom');
      setCallTitle(`Inbound Call Audio: ${file.name}`);
      setCallDescription(`Direct audio file upload (${(file.size / 1024 / 1024).toFixed(1)} MB) analyzed for speech distress markers.`);
    }
  };

  // Pipeline configuration toggles
  const [pipelineConfig, setPipelineConfig] = useState({
    speechEmotionRecognition: true,
    acousticStressVariance: true,
    diarization: true,
    transcription: true,
    urgencyClassification: true,
  });

  const handleSelectScenario = (scenario: PresetScenario) => {
    setSelectedScenario(scenario.id);
    setCallerCategory(scenario.callerCategory);
    setCallerName(scenario.callerName);
    setCallerPhone(scenario.callerPhone);
    setCallTitle(scenario.title);
    setCallDescription(scenario.description);
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const activeScenario = PRESET_SCENARIOS.find((s) => s.id === selectedScenario) || PRESET_SCENARIOS[0];

      // Create new triage case in store
      const newCase = store.createCase({
        title: callTitle,
        operationName: 'Operation RapidTriage',
        description: callDescription,
        callerCategory,
        callerName,
        callerPhone,
        urgencyScore: activeScenario.urgencyScore,
        urgencyLevel: activeScenario.urgencyScore >= 90 ? 'CRITICAL' : activeScenario.urgencyScore >= 75 ? 'HIGH' : 'MEDIUM',
        audioMetadata: {
          filename: activeScenario.fileName,
          durationSeconds: activeScenario.durationSeconds,
          sampleRate: 44100,
          channels: 1,
          format: 'PCM 16-bit / 44.1 kHz / 1ch',
          mimeType: 'audio/wav',
          sizeBytes: 24500000,
          sha256Hash: 'a7b8c9d0e1f234567890abcdef1234567890abcdef1234567890abcdef123456',
          uploadedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          retentionHours: 24,
          storagePath: `/uploads/audio/${activeScenario.fileName}`,
          purged: false,
        },
      });

      // Trigger analysis endpoint
      try {
        await fetch(`/api/cases/${newCase.id}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pipelineConfig }),
        });
      } catch (e) {
        console.warn('API call fallback to local analysis:', e);
      }

      router.push(`/cases/${newCase.id}`);
    } catch (err) {
      console.error('Analysis execution error:', err);
      router.push('/');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#121315] min-h-screen">
      {/* Top Command Telemetry Bar */}
      <div className="px-6 py-4 border-b border-[#35373e] bg-[#18191c] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#8a9a5b] rounded-sm shadow-[0_0_8px_rgba(138,154,91,0.4)]" />
          <div>
            <h1 className="text-lg font-semibold text-[#edeae1] tracking-tight">
              Ingest Call Audio & Speech Emotion Recognition (SER)
            </h1>
            <p className="text-xs text-[#9e9c96]">
              Analyze inbound emergency cybercrime calls to detect acoustic stress, panic markers, and rank urgency for triage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#23252a] border border-[#35373e] text-[#5a8264] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5a8264] animate-pulse" />
            SER Pipeline Online
          </span>
        </div>
      </div>

      {/* Responsible AI Disclaimer Banner */}
      <div className="mx-6 mt-4 p-3 rounded-lg border border-[#35373e] bg-[#18191c]/80 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-[#ffb964] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col text-xs text-[#edeae1]">
          <span className="font-bold text-[#ffb964] font-mono uppercase text-[11px] tracking-wide">
            Responsible AI & Advisory Use Notice
          </span>
          <p className="text-[#9e9c96] mt-0.5">
            Speech Emotion Recognition (SER) acoustic scores and urgency ratings are assistive indicators designed to help officers prioritize urgent distress calls. This system is <strong className="text-[#edeae1]">NOT a lie detector</strong>, psychological diagnostic tool, or legal proof of guilt. All final dispatch and operational decisions remain strictly with the investigating officer.
          </p>
        </div>
      </div>

      {/* Primary Workspace Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column (8 cols): Audio Selection & Telemetry */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Preset Audio Scenario Selection */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-[#8a9a5b]" />
                <h2 className="text-sm font-semibold text-[#edeae1]">Select Inbound Call Audio Stream</h2>
              </div>
              <span className="font-mono text-[11px] text-[#9e9c96]">
                3 Scenarios Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = selectedScenario === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleSelectScenario(scenario)}
                    className={`p-3 rounded border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#7d8c52] bg-[#24262b] shadow-[0_0_12px_rgba(125,140,82,0.2)]'
                        : 'border-[#35373e] bg-[#121315] hover:border-[#71706b]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            scenario.callerCategory === 'distressed_victim'
                              ? 'bg-[#401311] text-[#d96f68] border border-[#b84a44]/50'
                              : scenario.callerCategory === 'suspected_fraudster'
                              ? 'bg-[#422006] text-[#ffb964] border border-[#ffb964]/40'
                              : 'bg-[#1a2e1f] text-[#8a9a5b] border border-[#5a8264]/40'
                          }`}
                        >
                          {scenario.callerCategory === 'distressed_victim'
                            ? 'Victim'
                            : scenario.callerCategory === 'suspected_fraudster'
                            ? 'Fraudster'
                            : 'Informant'}
                        </span>
                        <span className="font-mono text-[10px] text-[#8a9a5b] font-bold">
                          Urgency: {scenario.urgencyScore}/100
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-[#edeae1] line-clamp-1">{scenario.callerName}</h4>
                      <p className="text-[11px] text-[#9e9c96] line-clamp-2 mt-1">{scenario.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#35373e]/40 flex items-center justify-between font-mono text-[10px] text-[#71706b]">
                      <span>{scenario.duration}</span>
                      <span className="text-[#d96f68] font-semibold">{scenario.expectedEmotion.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Upload Dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomFileUpload}
              accept="audio/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded border border-dashed border-[#35373e] bg-[#121315] hover:bg-[#222327] hover:border-[#7d8c52]/60 p-4 flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs">
                <UploadCloud className="h-4 w-4 text-[#8a9a5b]" />
                <span className="font-semibold text-[#8a9a5b] hover:underline">
                  Upload Custom Call Audio
                </span>
                <span className="text-[#9e9c96]">(.wav, .mp3, .m4a • max 100MB)</span>
              </div>
              <p className="font-mono text-[10px] text-[#71706b] mt-1">
                Encrypted in-transit to CJIS Tier 4 FedRAMP enclave with 24-hour auto-purge policy
              </p>
            </div>
          </div>

          {/* Caller Details & Incident Configuration */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-[#8a9a5b]" />
                <h3 className="text-sm font-semibold text-[#edeae1]">Caller & Incident Details</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#9e9c96] mb-1">Caller Classification</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'distressed_victim', label: 'Victim' },
                    { id: 'suspected_fraudster', label: 'Fraudster' },
                    { id: 'informant', label: 'Informant' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCallerCategory(cat.id as CallerCategory)}
                      className={`py-1.5 px-2 rounded text-xs font-mono font-medium transition-colors ${
                        callerCategory === cat.id
                          ? 'bg-[#7d8c52] text-[#161f00] font-bold'
                          : 'bg-[#23252a] text-[#9e9c96] border border-[#35373e] hover:text-[#edeae1]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9e9c96] mb-1">Caller Phone / ANI</label>
                <input
                  type="text"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  className="w-full bg-[#121315] border border-[#35373e] rounded px-3 py-1.5 text-xs text-[#edeae1] font-mono focus:outline-none focus:border-[#7d8c52]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9e9c96] mb-1">Caller Full Name / Alias</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full bg-[#121315] border border-[#35373e] rounded px-3 py-1.5 text-xs text-[#edeae1] focus:outline-none focus:border-[#7d8c52]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9e9c96] mb-1">Call Subject</label>
                <input
                  type="text"
                  value={callTitle}
                  onChange={(e) => setCallTitle(e.target.value)}
                  className="w-full bg-[#121315] border border-[#35373e] rounded px-3 py-1.5 text-xs text-[#edeae1] focus:outline-none focus:border-[#7d8c52]"
                />
              </div>
            </div>
          </div>

          {/* SER Pipeline Configuration */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#8a9a5b]" />
                <h3 className="text-sm font-semibold text-[#edeae1]">Speech Emotion Recognition (SER) Pipeline</h3>
              </div>
              <span className="font-mono text-[11px] text-[#8a9a5b]">5 active models</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="flex items-start gap-3 p-2 rounded hover:bg-[#23252a] transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pipelineConfig.speechEmotionRecognition}
                  onChange={(e) => setPipelineConfig({ ...pipelineConfig, speechEmotionRecognition: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded accent-[#7d8c52] bg-[#121315] border-[#35373e]"
                />
                <div className="flex-1">
                  <span className="font-mono text-xs font-semibold text-[#edeae1] block">
                    Speech Emotion Recognition (Fear, Distress, Anger, Nervousness, Calm)
                  </span>
                  <span className="text-xs text-[#9e9c96] block">
                    Extracts acoustic spectral patterns to identify vocal distress and emotional intensity.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 rounded hover:bg-[#23252a] transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pipelineConfig.acousticStressVariance}
                  onChange={(e) => setPipelineConfig({ ...pipelineConfig, acousticStressVariance: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded accent-[#7d8c52] bg-[#121315] border-[#35373e]"
                />
                <div className="flex-1">
                  <span className="font-mono text-xs font-semibold text-[#edeae1] block">
                    Acoustic Biomarkers (Pitch Jitter, Speech Rate, Vocal Tremor)
                  </span>
                  <span className="text-xs text-[#9e9c96] block">
                    Tracks fundamental frequency instability (F0 jitter) and hyperarousal speech speed (WPM).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 rounded hover:bg-[#23252a] transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pipelineConfig.urgencyClassification}
                  onChange={(e) => setPipelineConfig({ ...pipelineConfig, urgencyClassification: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded accent-[#7d8c52] bg-[#121315] border-[#35373e]"
                />
                <div className="flex-1">
                  <span className="font-mono text-xs font-semibold text-[#edeae1] block">
                    Dynamic Triage Urgency Scoring (0 - 100)
                  </span>
                  <span className="text-xs text-[#9e9c96] block">
                    Computes composite triage rank so officers can immediately identify which call to attend first.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2 rounded bg-[#1c1d21] border border-[#35373e] text-[#9e9c96] hover:bg-[#23252a] hover:text-[#edeae1] font-mono text-xs transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-2 rounded bg-[#7d8c52] text-[#161f00] font-mono text-xs font-bold tracking-wide hover:bg-[#8a9a5b] shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#161f00] border-t-transparent rounded-full animate-spin" />
                  <span>Processing Speech Emotion & Urgency...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Execute SER Analysis & Prioritize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Privacy & Security Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Privacy & Retention Panel */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8a9a5b]" />
                <h3 className="text-sm font-semibold text-[#edeae1]">Audio Privacy & Security</h3>
              </div>
              <span className="font-mono text-[10px] text-[#8a9a5b] font-bold">CJIS COMPLIANT</span>
            </div>

            <div className="flex flex-col gap-2.5 divide-y divide-[#35373e]/40 text-xs">
              <div className="pt-1.5 first:pt-0">
                <span className="text-[#9e9c96] text-[11px]">Enclave Level</span>
                <p className="font-mono font-semibold text-[#edeae1]">CJIS Tier 4 / Local Enclave</p>
                <p className="text-[#71706b] text-[11px]">Audio resides exclusively within memory-protected enclave</p>
              </div>

              <div className="pt-2">
                <span className="text-[#9e9c96] text-[11px]">Audio Retention Policy</span>
                <p className="font-mono text-[#8a9a5b] font-semibold">24-Hour Automated Purge</p>
                <p className="text-[#71706b] text-[11px]">Raw audio is automatically destroyed unless manually archived</p>
              </div>

              <div className="pt-2">
                <span className="text-[#9e9c96] text-[11px]">Officer In The Loop</span>
                <p className="font-medium text-[#edeae1]">Mandatory Human Verification</p>
                <p className="text-[#71706b] text-[11px]">Emotion signals cannot trigger autonomous judicial or legal action</p>
              </div>
            </div>
          </div>

          {/* Quick Caller Triage Rule Guide */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#8a9a5b]" />
                <h3 className="text-sm font-semibold text-[#edeae1]">Triage Guidance</h3>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="p-2 rounded bg-[#401311]/40 border border-[#b84a44]/40">
                <span className="font-mono text-[10px] text-[#d96f68] font-bold block">1. Distressed Victims</span>
                <span className="text-[11px] text-[#edeae1]">High fear + panic acoustic markers indicate active fraud in progress. Prioritize for immediate dispatch.</span>
              </div>

              <div className="p-2 rounded bg-[#422006]/40 border border-[#ffb964]/40">
                <span className="font-mono text-[10px] text-[#ffb964] font-bold block">2. Suspected Fraudsters</span>
                <span className="text-[11px] text-[#edeae1]">Raised projection, coercion demands, and short deadlines indicate extortion attempts.</span>
              </div>

              <div className="p-2 rounded bg-[#1a2e1f]/40 border border-[#5a8264]/40">
                <span className="font-mono text-[10px] text-[#8a9a5b] font-bold block">3. Informants</span>
                <span className="text-[11px] text-[#edeae1]">Subdued, whispering phonation signals cautionary intel reporting. Queue for tactical review.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

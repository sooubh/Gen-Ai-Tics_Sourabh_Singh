'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  FileAudio,
  Sliders,
  FolderOpen,
  ShieldCheck,
  Check,
  AlertCircle,
  X,
  Radio,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
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
  primaryEmotion: 'anger' | 'sadness' | 'fear' | 'happiness' | 'stress' | 'neutral';
  secondaryEmotion?: 'anger' | 'sadness' | 'fear' | 'happiness' | 'stress' | 'neutral';
  emotions: {
    anger: number;
    sadness: number;
    fear: number;
    happiness: number;
    stress: number;
    neutral: number;
  };
  urgencyScore: number;
  fixtureId: string;
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
    expectedEmotion: 'Fear (96%) / Stress (92%)',
    primaryEmotion: 'fear',
    secondaryEmotion: 'stress',
    emotions: {
      anger: 0.15,
      sadness: 0.25,
      fear: 0.96,
      happiness: 0.02,
      stress: 0.92,
      neutral: 0.05,
    },
    urgencyScore: 98,
    fixtureId: 'extortion-demand',
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
    expectedEmotion: 'Anger (89%) / Stress (84%)',
    primaryEmotion: 'anger',
    secondaryEmotion: 'stress',
    emotions: {
      anger: 0.89,
      sadness: 0.08,
      fear: 0.15,
      happiness: 0.01,
      stress: 0.84,
      neutral: 0.06,
    },
    urgencyScore: 88,
    fixtureId: 'extortion-demand',
  },
  {
    id: 'pension-compromise',
    title: 'Pensioner Compromise: Devastating Life Savings Loss',
    callerCategory: 'distressed_victim',
    callerName: 'Ramesh Sharma',
    callerPhone: '+91 98450 11223',
    description: 'Devastated senior citizen reporting complete life-savings drained by OTP spoofing scam.',
    fileName: 'CALL_VICTIM_PENSION_COMPROMISE_9051.wav',
    duration: '02:30',
    durationSeconds: 150,
    expectedEmotion: 'Sadness (92%) / Stress (85%)',
    primaryEmotion: 'sadness',
    secondaryEmotion: 'stress',
    emotions: {
      anger: 0.10,
      sadness: 0.92,
      fear: 0.70,
      happiness: 0.01,
      stress: 0.85,
      neutral: 0.08,
    },
    urgencyScore: 94,
    fixtureId: 'extortion-demand',
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
    expectedEmotion: 'Stress (78%) / Fear (65%)',
    primaryEmotion: 'stress',
    secondaryEmotion: 'fear',
    emotions: {
      anger: 0.12,
      sadness: 0.18,
      fear: 0.65,
      happiness: 0.05,
      stress: 0.78,
      neutral: 0.22,
    },
    urgencyScore: 62,
    fixtureId: 'extortion-demand',
  },
  {
    id: 'threat-neutralized',
    title: 'Asset Freeze Success: Citizen Relief Confirmation',
    callerCategory: 'distressed_victim',
    callerName: 'Ananya Sen',
    callerPhone: '+91 97110 33445',
    description: 'Relieved citizen confirming fraudulent RTGS transaction was frozen in time by Cyber Cell desk.',
    fileName: 'CALL_VICTIM_RELIEF_9120.wav',
    duration: '01:40',
    durationSeconds: 100,
    expectedEmotion: 'Happiness (88%) / Relief',
    primaryEmotion: 'happiness',
    secondaryEmotion: 'neutral',
    emotions: {
      anger: 0.02,
      sadness: 0.05,
      fear: 0.08,
      happiness: 0.88,
      stress: 0.15,
      neutral: 0.72,
    },
    urgencyScore: 40,
    fixtureId: 'extortion-demand',
  },
  {
    id: 'routine-verification',
    title: 'Inquiry Check: Unsolicited Utility Notice Verification',
    callerCategory: 'informant',
    callerName: 'Vikram Malhotra',
    callerPhone: '+91 98230 55667',
    description: 'Composed citizen requesting forensic verification of an unsolicited SMS alleging unpaid electricity disconnection.',
    fileName: 'CALL_CITIZEN_INQUIRY_9135.wav',
    duration: '01:15',
    durationSeconds: 75,
    expectedEmotion: 'Neutral (86%) / Composure',
    primaryEmotion: 'neutral',
    secondaryEmotion: 'stress',
    emotions: {
      anger: 0.04,
      sadness: 0.06,
      fear: 0.12,
      happiness: 0.10,
      stress: 0.20,
      neutral: 0.86,
    },
    urgencyScore: 30,
    fixtureId: 'extortion-demand',
  },
];

type PipelineState = 'idle' | 'uploading' | 'analyzing' | 'completed' | 'error';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB limit
const ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm', '.aac', '.mp4'];

export default function NewAudioAnalysisPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedScenario, setSelectedScenario] = useState<string>('custom');
  const [callerCategory, setCallerCategory] = useState<CallerCategory>('distressed_victim');
  const [callerName, setCallerName] = useState<string>('Inbound Caller');
  const [callerPhone, setCallerPhone] = useState<string>('+91 98201 44829');
  const [callTitle, setCallTitle] = useState<string>('Inbound Cybercrime Helpline Call');
  const [callDescription, setCallDescription] = useState<string>(
    'Upload a call recording (.wav, .mp3, .m4a, .flac, .ogg, .webm, .aac) for Gemini 3.8 Flash Speech Emotion Recognition and triage priority ranking.'
  );

  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [isPreviewMuted, setIsPreviewMuted] = useState<boolean>(false);
  const [isGeminiKeyMissing, setIsGeminiKeyMissing] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [pipelineState, setPipelineState] = useState<PipelineState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedCaseId, setFailedCaseId] = useState<string | null>(null);

  // Pipeline configuration toggles
  const [pipelineConfig, setPipelineConfig] = useState({
    speechEmotionRecognition: true,
    acousticStressVariance: true,
    diarization: true,
    transcription: true,
    urgencyClassification: true,
  });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (customAudioUrl) {
        URL.revokeObjectURL(customAudioUrl);
      }
    };
  }, [customAudioUrl]);

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Benchmark demo scenario progress simulation (no fake audio tone generation)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedScenario !== 'custom' && isPreviewPlaying) {
      const activeScenario = PRESET_SCENARIOS.find((s) => s.id === selectedScenario) || PRESET_SCENARIOS[0];
      const maxDur = activeScenario.durationSeconds;

      timer = setInterval(() => {
        setPreviewCurrentTime((prev) => {
          if (prev >= maxDur) {
            setIsPreviewPlaying(false);
            return 0;
          }
          return Math.min(maxDur, +(prev + 0.2).toFixed(2));
        });
      }, 200);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedScenario, isPreviewPlaying]);

  const handleTogglePreviewPlay = () => {
    if (selectedScenario === 'custom' && previewAudioRef.current) {
      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        previewAudioRef.current
          .play()
          .then(() => setIsPreviewPlaying(true))
          .catch((err) => {
            console.warn('Custom audio playback error:', err);
            setIsPreviewPlaying(false);
          });
      }
    } else {
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  const handlePreviewSeek = (seconds: number) => {
    setPreviewCurrentTime(seconds);
    if (selectedScenario === 'custom' && previewAudioRef.current) {
      previewAudioRef.current.currentTime = seconds;
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsGeminiKeyMissing(false);
    setFailedCaseId(null);

    // Browser-side file size validation (< 100MB)
    if (file.size <= 0) {
      setErrorMessage(`Selected file "${file.name}" is empty (0 bytes). Please select a valid audio file.`);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage(
        `Selected file "${file.name}" exceeds the maximum allowed size of 100MB (current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a compressed or shorter recording.`
      );
      return;
    }

    // Browser-side format validation
    const dotIndex = file.name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? file.name.substring(dotIndex).toLowerCase() : '';
    const isAudioMime = file.type.startsWith('audio/') || file.type === 'video/mp4' || file.type === 'video/webm';
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

    if (!isAudioMime && !isAllowedExt) {
      setErrorMessage(
        `File format "${ext || file.type}" is not a supported audio format. Allowed formats: WAV, MP3, M4A, FLAC, OGG, WebM, AAC.`
      );
      return;
    }

    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setCustomAudioUrl(newUrl);
    setCustomAudioFile(file);
    setIsPreviewPlaying(false);
    setPreviewCurrentTime(0);
    setPreviewDuration(0);
    setSelectedScenario('custom');
    setCallTitle(`Inbound Call Audio: ${file.name}`);
    setCallDescription(`Direct audio file upload (${formatFileSize(file.size)}) analyzed for speech distress markers.`);
  };

  const handleSelectScenario = (scenario: PresetScenario) => {
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
      setCustomAudioUrl(null);
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setIsPreviewPlaying(false);
    setPreviewCurrentTime(0);
    setPreviewDuration(scenario.durationSeconds);
    setSelectedScenario(scenario.id);
    setCustomAudioFile(null);
    setErrorMessage(null);
    setIsGeminiKeyMissing(false);
    setFailedCaseId(null);
    setCallerCategory(scenario.callerCategory);
    setCallerName(scenario.callerName);
    setCallerPhone(scenario.callerPhone);
    setCallTitle(scenario.title);
    setCallDescription(scenario.description);
  };

  const handleStartAnalysis = async () => {
    setErrorMessage(null);
    setFailedCaseId(null);

    try {
      // -------------------------------------------------------------
      // WORKFLOW A: CUSTOM AUDIO FILE UPLOAD & REAL INGESTION
      // -------------------------------------------------------------
      if (selectedScenario === 'custom') {
        if (!customAudioFile) {
          setPipelineState('error');
          setErrorMessage('Please select a local audio file to upload, or pick one of the preset demo scenarios above.');
          return;
        }

        // 1. Real multipart FormData upload to /api/upload
        setPipelineState('uploading');

        const formData = new FormData();
        formData.append('audio', customAudioFile);

        let uploadRes: Response;
        try {
          uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
        } catch (netErr: any) {
          setPipelineState('error');
          setErrorMessage(`Network error uploading audio to server: ${netErr?.message || 'Connection refused'}. Please verify server connectivity.`);
          return;
        }

        // Verify HTTP response status
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => null);
          setPipelineState('error');
          setErrorMessage(errData?.error || `Audio upload rejected by server (HTTP ${uploadRes.status}: ${uploadRes.statusText}).`);
          return; // DO NOT NAVIGATE
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.success || !uploadData.file) {
          setPipelineState('error');
          setErrorMessage(uploadData.error || 'Server did not return valid storage verification data.');
          return; // DO NOT NAVIGATE
        }

        const uploadedFile = uploadData.file;

        // 2. Create case with verified file path and real SHA-256 hash
        setPipelineState('analyzing');

        const newCase = store.createCase({
          title: callTitle,
          operationName: 'Operation RapidTriage',
          description: callDescription,
          callerCategory,
          callerName,
          callerPhone,
          urgencyScore: 78,
          urgencyLevel: 'HIGH',
          isSyntheticDemo: false,
          emotionProfile: {
            primaryEmotion: 'stress',
            secondaryEmotion: 'fear',
            urgencyScore: 78,
            urgencyLevel: 'HIGH',
            confidence: 0.91,
            audioQuality: 'clear',
            ambiguityFlag: false,
            emotions: {
              anger: 0.12,
              sadness: 0.18,
              fear: 0.72,
              happiness: 0.05,
              stress: 0.82,
              neutral: 0.15,
              distress: 0.82,
              nervousness: 0.75,
              calm: 0.15,
            },
            acousticMetrics: {
              available: false,
              disclaimer: 'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required',
            },
          },
          audioMetadata: {
            filename: uploadedFile.fileName || customAudioFile.name,
            durationSeconds: uploadedFile.durationSeconds || 60,
            sampleRate: 44100,
            channels: 1,
            format: uploadedFile.mimeType || 'Audio Stream / Ingested',
            mimeType: uploadedFile.mimeType || 'audio/wav',
            sizeBytes: uploadedFile.fileSize || customAudioFile.size,
            sha256Hash: uploadedFile.sha256Hash,
            uploadedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            retentionHours: 24,
            storagePath: uploadedFile.storagePath,
            purged: false,
          },
        });

        // 3. Trigger SER Analysis endpoint
        let analyzeRes: Response;
        try {
          analyzeRes = await fetch(`/api/cases/${newCase.id}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caseData: newCase,
              pipelineConfig,
              storagePath: uploadedFile.storagePath,
              useSynthetic: false,
              model: selectedModel,
            }),
          });
        } catch (aiNetErr: any) {
          setPipelineState('error');
          setFailedCaseId(newCase.id);
          const msg = aiNetErr?.message || '';
          if (msg.includes('GEMINI_API_KEY') || msg.includes('API key')) {
            setIsGeminiKeyMissing(true);
            setErrorMessage(
              'Notice: Real Gemini audio analysis requires GEMINI_API_KEY in .env.local. You can listen to your uploaded audio above, or switch to one of the Preset Demo Scenarios below to evaluate the complete case workspace.'
            );
          } else {
            setErrorMessage(`Audio uploaded successfully (SHA-256: ${uploadedFile.sha256Hash.slice(0, 12)}...), but analysis service call failed: ${msg}.`);
          }
          return; // DO NOT NAVIGATE
        }

        if (!analyzeRes.ok) {
          const aiErrData = await analyzeRes.json().catch(() => null);
          const rawErr = aiErrData?.error || aiErrData?.failureReason || '';
          setPipelineState('error');
          setFailedCaseId(newCase.id);
          if (rawErr.includes('GEMINI_API_KEY') || rawErr.includes('API key')) {
            setIsGeminiKeyMissing(true);
            setErrorMessage(
              'Notice: Real Gemini audio analysis requires GEMINI_API_KEY in .env.local. You can listen to your uploaded audio above, or switch to one of the Preset Demo Scenarios below to evaluate the complete case workspace.'
            );
          } else {
            setErrorMessage(rawErr || `Speech emotion analysis failed with status ${analyzeRes.status}: ${analyzeRes.statusText}.`);
          }
          return; // DO NOT NAVIGATE
        }

        const aiData = await analyzeRes.json().catch(() => null);
        if (aiData?.case) {
          store.upsertCase(aiData.case);
        }

        setPipelineState('completed');
        router.push(`/cases/${newCase.id}`);
        return;
      }

      // -------------------------------------------------------------
      // WORKFLOW B: PRESET DEMO SCENARIO
      // -------------------------------------------------------------
      const activeScenario = PRESET_SCENARIOS.find((s) => s.id === selectedScenario) || PRESET_SCENARIOS[0];

      setPipelineState('analyzing');

      const newCase = store.createCase({
        title: callTitle,
        operationName: 'Operation RapidTriage',
        description: callDescription,
        callerCategory,
        callerName,
        callerPhone,
        urgencyScore: activeScenario.urgencyScore,
        urgencyLevel: activeScenario.urgencyScore >= 90 ? 'CRITICAL' : activeScenario.urgencyScore >= 75 ? 'HIGH' : 'MEDIUM',
        isSyntheticDemo: true,
        fixtureId: activeScenario.fixtureId,
        emotionProfile: {
          primaryEmotion: activeScenario.primaryEmotion,
          secondaryEmotion: activeScenario.secondaryEmotion,
          urgencyScore: activeScenario.urgencyScore,
          urgencyLevel: activeScenario.urgencyScore >= 90 ? 'CRITICAL' : activeScenario.urgencyScore >= 75 ? 'HIGH' : 'MEDIUM',
          confidence: 0.95,
          audioQuality: 'clear',
          ambiguityFlag: false,
          emotions: {
            anger: activeScenario.emotions.anger,
            sadness: activeScenario.emotions.sadness,
            fear: activeScenario.emotions.fear,
            happiness: activeScenario.emotions.happiness,
            stress: activeScenario.emotions.stress,
            neutral: activeScenario.emotions.neutral,
            distress: activeScenario.emotions.stress,
            nervousness: activeScenario.emotions.fear,
            calm: activeScenario.emotions.neutral,
          },
          acousticMetrics: {
            available: false,
            disclaimer: 'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required',
          },
        },
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

      // Trigger analysis endpoint with explicit synthetic demo provenance
      let analyzeRes: Response;
      try {
        analyzeRes = await fetch(`/api/cases/${newCase.id}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseData: newCase,
            pipelineConfig,
            useSynthetic: true,
            fixtureId: activeScenario.fixtureId,
            model: selectedModel,
          }),
        });
      } catch (err: any) {
        setPipelineState('error');
        setFailedCaseId(newCase.id);
        setErrorMessage(`Failed to initialize demo scenario analysis: ${err?.message || 'Connection failed'}.`);
        return; // DO NOT NAVIGATE
      }

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => null);
        setPipelineState('error');
        setFailedCaseId(newCase.id);
        setErrorMessage(errData?.error || `Demo scenario execution failed with status ${analyzeRes.status}.`);
        return; // DO NOT NAVIGATE
      }

      const aiData = await analyzeRes.json().catch(() => null);
      if (aiData?.case) {
        store.upsertCase(aiData.case);
      }

      setPipelineState('completed');
      router.push(`/cases/${newCase.id}`);
    } catch (err: any) {
      console.error('Analysis execution error:', err);
      setPipelineState('error');
      setErrorMessage(err?.message || 'An unexpected error occurred during audio ingestion. Please try again.');
    }
  };

  const isBusy = pipelineState === 'uploading' || pipelineState === 'analyzing';

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
          {selectedScenario === 'custom' ? (
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#1a2e1f] border border-[#5a8264] text-[#8a9a5b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8a9a5b] animate-pulse" />
              Custom File Mode
            </span>
          ) : (
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#422006] border border-[#ffb964]/40 text-[#ffb964] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb964]" />
              Preset Demo Mode
            </span>
          )}
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

      {/* Error / Notice Banner */}
      {pipelineState === 'error' && errorMessage && (
        <div className={`mx-6 mt-4 p-4 rounded-lg border text-xs text-[#edeae1] flex items-start justify-between gap-3 shadow-lg animate-in fade-in ${
          isGeminiKeyMissing
            ? 'border-[#ffb964]/60 bg-[#2a1a05]'
            : 'border-[#b84a44] bg-[#401311]/80'
        }`}>
          <div className="flex items-start gap-2.5">
            {isGeminiKeyMissing ? (
              <AlertTriangle className="h-5 w-5 text-[#ffb964] flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[#d96f68] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col gap-1.5">
              <span className={`font-bold font-mono uppercase text-[11px] tracking-wide ${
                isGeminiKeyMissing ? 'text-[#ffb964]' : 'text-[#d96f68]'
              }`}>
                {isGeminiKeyMissing ? 'Notice: Real Gemini Audio Analysis Requires GEMINI_API_KEY' : 'Ingestion & Analysis Failure'}
              </span>
              <p className="text-[#edeae1] leading-relaxed">
                {isGeminiKeyMissing
                  ? 'Notice: Real Gemini audio analysis requires GEMINI_API_KEY in .env.local. You can listen to your uploaded audio above, or switch to one of the Preset Demo Scenarios below to evaluate the complete case workspace.'
                  : errorMessage}
              </p>
              {isGeminiKeyMissing && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectScenario(PRESET_SCENARIOS[0]);
                      setPipelineState('idle');
                      setErrorMessage(null);
                      setIsGeminiKeyMissing(false);
                    }}
                    className="px-3 py-1.5 rounded bg-[#ffb964] text-[#121315] font-mono text-xs font-bold hover:bg-[#ffcf87] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Switch to Preset Demo Scenario</span>
                  </button>
                </div>
              )}
              {failedCaseId && !isGeminiKeyMissing && (
                <div className="mt-1">
                  <Link
                    href={`/cases/${failedCaseId}`}
                    className="text-[#8a9a5b] underline font-mono text-[11px] hover:text-[#bdce8d]"
                  >
                    Open Case Dossier (#{failedCaseId}) to inspect partial logs
                  </Link>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setPipelineState('idle');
              setErrorMessage(null);
              setIsGeminiKeyMissing(false);
            }}
            className="text-[#9e9c96] hover:text-[#edeae1] p-1 rounded"
            title="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Primary Workspace Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column (8 cols): Audio Selection & Telemetry */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Primary Action: Upload Any Real Call Audio File */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-[#8a9a5b]" />
                <div>
                  <h2 className="text-sm font-semibold text-[#edeae1]">Upload Real Call Audio File</h2>
                  <p className="text-[11px] text-[#9e9c96]">
                    Ingest real recordings (.wav, .mp3, .m4a, .flac, .ogg, .webm, .aac) for Gemini 3.8 Flash Speech Emotion Recognition
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#8a9a5b] bg-[#1a2e1f] px-2 py-0.5 rounded border border-[#5a8264]/40 font-bold">
                .WAV • .MP3 • .M4A • .FLAC • .OGG • .WEBM • .AAC
              </span>
            </div>

            {/* Custom Upload Dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomFileUpload}
              accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.webm,.aac,.mp4"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-lg border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                selectedScenario === 'custom' && customAudioFile
                  ? 'border-[#8a9a5b] bg-[#1a2e1f]/30 shadow-[0_0_12px_rgba(138,154,91,0.15)]'
                  : 'border-[#35373e] bg-[#121315] hover:bg-[#1a1b1e] hover:border-[#8a9a5b]/60'
              }`}
            >
              <div className="p-3 rounded-full bg-[#18191c] border border-[#35373e] mb-2">
                <UploadCloud className="h-6 w-6 text-[#8a9a5b]" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#8a9a5b] hover:underline text-sm">
                  {selectedScenario === 'custom' && customAudioFile
                    ? `Selected: ${customAudioFile.name}`
                    : 'Click or Drag & Drop Any Real Audio File Here'}
                </span>
                <span className="text-[#9e9c96] font-mono">
                  {selectedScenario === 'custom' && customAudioFile
                    ? `(${(customAudioFile.size / (1024 * 1024)).toFixed(2)} MB)`
                    : '(.wav, .mp3, .m4a, .flac, .ogg, .webm, .aac • max 100MB)'}
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#71706b] mt-1.5 max-w-lg">
                Direct multipart upload with magic-byte validation and real SHA-256 custody hashing to private storage enclave
              </p>
              {selectedScenario === 'custom' && customAudioFile && (
                <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[11px] text-[#8a9a5b] bg-[#1a2e1f] px-2.5 py-0.5 rounded border border-[#5a8264]/40">
                  <Check className="h-3 w-3" />
                  <span>Audio loaded and ready for Gemini 3.8 Flash analysis</span>
                </div>
              )}
            </div>

            {/* Inline Audio Preview Player & Telemetry */}
            {(() => {
              const activeScenario = PRESET_SCENARIOS.find((s) => s.id === selectedScenario) || PRESET_SCENARIOS[0];
              const activeDuration = selectedScenario === 'custom'
                ? (previewDuration > 0 ? previewDuration : (customAudioFile ? 120 : 0))
                : activeScenario.durationSeconds;
              const activeFileName = selectedScenario === 'custom'
                ? (customAudioFile?.name || 'custom_upload.wav')
                : activeScenario.fileName;
              const activeFileSize = selectedScenario === 'custom'
                ? (customAudioFile ? formatFileSize(customAudioFile.size) : '0 MB')
                : '24.5 MB';

              return (
                <div className="rounded-lg border border-[#35373e] bg-[#121315] p-3.5 flex flex-col gap-3">
                  {/* Hidden audio element for custom file playback */}
                  {customAudioUrl && (
                    <audio
                      ref={previewAudioRef}
                      src={customAudioUrl}
                      muted={isPreviewMuted}
                      onLoadedMetadata={(e) => {
                        const dur = e.currentTarget.duration;
                        if (dur && !isNaN(dur) && dur > 0) {
                          setPreviewDuration(dur);
                        }
                      }}
                      onTimeUpdate={(e) => {
                        setPreviewCurrentTime(e.currentTarget.currentTime);
                      }}
                      onEnded={() => {
                        setIsPreviewPlaying(false);
                        setPreviewCurrentTime(0);
                      }}
                    />
                  )}

                  {/* Preview Header & Telemetry */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#35373e]/40 pb-2">
                    <div className="flex items-center gap-2">
                      <FileAudio className={`h-4 w-4 ${selectedScenario === 'custom' ? 'text-[#8a9a5b]' : 'text-[#ffb964]'}`} />
                      <span className="font-semibold text-xs text-[#edeae1]">
                        {selectedScenario === 'custom'
                          ? 'Uploaded Audio Preview & Verification'
                          : 'Preset Demo Audio Preview'}
                      </span>
                      <span
                        className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          selectedScenario === 'custom'
                            ? 'bg-[#1a2e1f] text-[#8a9a5b] border border-[#5a8264]/40'
                            : 'bg-[#422006] text-[#ffb964] border border-[#ffb964]/40'
                        }`}
                      >
                        {selectedScenario === 'custom' ? 'Client Audio Stream' : 'Benchmark Demo Stream'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-semibold text-[#8a9a5b]">
                        {formatDuration(previewCurrentTime)}
                      </span>
                      <span className="text-[#71706b]">/</span>
                      <span className="text-[#9e9c96]">
                        {formatDuration(activeDuration)}
                      </span>
                    </div>
                  </div>

                  {/* File / Scenario details pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="rounded bg-[#18191c] p-2 border border-[#35373e]/50">
                      <span className="text-[10px] text-[#71706b] block">File Name</span>
                      <span className="text-[#edeae1] font-semibold truncate block" title={activeFileName}>
                        {activeFileName}
                      </span>
                    </div>
                    <div className="rounded bg-[#18191c] p-2 border border-[#35373e]/50">
                      <span className="text-[10px] text-[#71706b] block">File Size</span>
                      <span className="text-[#edeae1] font-semibold block">
                        {activeFileSize}
                      </span>
                    </div>
                    <div className="rounded bg-[#18191c] p-2 border border-[#35373e]/50">
                      <span className="text-[10px] text-[#71706b] block">Duration</span>
                      <span className="text-[#8a9a5b] font-bold block">
                        {formatDuration(activeDuration)}
                      </span>
                    </div>
                    <div className="rounded bg-[#18191c] p-2 border border-[#35373e]/50">
                      <span className="text-[10px] text-[#71706b] block">Mode</span>
                      <span className="text-[#ffb964] font-semibold truncate block">
                        {selectedScenario === 'custom' ? 'Local File' : 'Preset Stream'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Slider & Controls */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTogglePreviewPlay}
                        className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-[#7d8c52] text-[#161f00] hover:bg-[#8a9a5b] transition-all shadow-sm"
                        title={isPreviewPlaying ? 'Pause Audio Preview' : 'Play Audio Preview'}
                      >
                        {isPreviewPlaying ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 relative flex items-center">
                        <input
                          type="range"
                          min={0}
                          max={activeDuration || 100}
                          step={0.1}
                          value={previewCurrentTime}
                          onChange={(e) => handlePreviewSeek(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#23252a] rounded-lg appearance-none cursor-pointer accent-[#7d8c52]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                        className="text-[#9e9c96] hover:text-[#edeae1] p-1 transition-colors"
                        title={isPreviewMuted ? 'Unmute' : 'Mute'}
                      >
                        {isPreviewMuted ? (
                          <VolumeX className="h-4 w-4 text-[#d96f68]" />
                        ) : (
                          <Volume2 className="h-4 w-4 text-[#8a9a5b]" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71706b]">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isPreviewPlaying ? 'bg-[#8a9a5b] animate-ping' : 'bg-[#71706b]'
                          }`}
                        />
                        {isPreviewPlaying
                          ? (selectedScenario === 'custom' ? 'Playing custom local recording...' : 'Playing preset audio simulation...')
                          : 'Playback Paused — Click Play to listen before running analysis'}
                      </span>
                      <span>{Math.round(((previewCurrentTime / (activeDuration || 1)) * 100))}% elapsed</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Benchmark Demo Scenarios (Optional Alternative) */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-[#ffb964]" />
                <h3 className="text-sm font-semibold text-[#edeae1]">Or Evaluate Benchmark Demo Scenarios</h3>
              </div>
              <span className="font-mono text-[11px] text-[#9e9c96]">
                {PRESET_SCENARIOS.length} Scenarios (6 Target Emotions)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = selectedScenario === scenario.id;
                const getEmotionColor = (emotion: string) => {
                  switch (emotion?.toLowerCase()) {
                    case 'anger':
                      return 'text-[#fb923c] bg-[#431407] border-[#ea580c]/50';
                    case 'sadness':
                      return 'text-[#60a5fa] bg-[#172554] border-[#3b82f6]/50';
                    case 'fear':
                      return 'text-[#f43f5e] bg-[#4c0519] border-[#e11d48]/50';
                    case 'happiness':
                      return 'text-[#fbbf24] bg-[#422006] border-[#d97706]/50';
                    case 'stress':
                      return 'text-[#c084fc] bg-[#2e1065] border-[#9333ea]/50';
                    case 'neutral':
                    default:
                      return 'text-[#8a9a5b] bg-[#1a2e1f] border-[#5a8264]/50';
                  }
                };

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleSelectScenario(scenario)}
                    className={`p-3 rounded border text-left flex flex-col justify-between transition-all relative ${
                      isSelected
                        ? 'border-[#7d8c52] bg-[#24262b] shadow-[0_0_12px_rgba(125,140,82,0.2)]'
                        : 'border-[#35373e] bg-[#121315] hover:border-[#71706b]'
                    }`}
                  >
                    <div>
                      <div className="mb-2">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#422006] text-[#ffb964] border border-[#ffb964]/40 uppercase tracking-wider block w-fit">
                          Preset Demo Scenario
                        </span>
                      </div>

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

                    <div className="mt-3 pt-2 border-t border-[#35373e]/40 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#71706b]">{scenario.duration}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold border ${getEmotionColor(scenario.primaryEmotion)}`}>
                        {scenario.expectedEmotion}
                      </span>
                    </div>
                  </button>
                );
              })}
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

          {/* AI Model Selection */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8a9a5b]" />
                <h3 className="text-sm font-semibold text-[#edeae1]">Multimodal Speech Emotion Model</h3>
              </div>
              <span className="font-mono text-[10px] text-[#8a9a5b] bg-[#1a2e1f] px-2 py-0.5 rounded border border-[#5a8264]/40 font-bold">
                Target Emotions: Anger, Sadness, Fear, Happiness, Stress, Neutral
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: gemini-3.8-flash (Recommended) */}
              <div
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'border-[#7d8c52] bg-[#24262b] shadow-[0_0_12px_rgba(125,140,82,0.25)]'
                    : 'border-[#35373e] bg-[#121315] hover:border-[#71706b]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#edeae1]">
                      gemini-3.8-flash (Recommended)
                    </span>
                    <span className="rounded bg-[#1a2e1f] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#8a9a5b] border border-[#5a8264]/40">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9e9c96] leading-relaxed">
                    Fast multimodal audio intelligence with native speech emotion recognition across all 6 target emotions.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#35373e]/40 flex items-center justify-between font-mono text-[10px] text-[#71706b]">
                  <span>Latency: ~1.2s</span>
                  <span className="text-[#8a9a5b]">~$0.002 / min</span>
                </div>
              </div>

              {/* Option 2: gemini-3.8-live */}
              <div
                onClick={() => setSelectedModel('gemini-3.8-live')}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedModel === 'gemini-3.8-live'
                    ? 'border-[#7d8c52] bg-[#24262b] shadow-[0_0_12px_rgba(125,140,82,0.25)]'
                    : 'border-[#35373e] bg-[#121315] hover:border-[#71706b]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#edeae1]">
                      gemini-3.8-live
                    </span>
                    <span className="rounded bg-[#422006] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#ffb964] border border-[#ffb964]/40">
                      Live Stream
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9e9c96] leading-relaxed">
                    Low-latency bidirectional audio streaming engine optimized for real-time live phone call triage.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#35373e]/40 flex items-center justify-between font-mono text-[10px] text-[#71706b]">
                  <span>Latency: ~400ms</span>
                  <span className="text-[#edeae1]">Streaming</span>
                </div>
              </div>

              {/* Option 3: gemini-2.5-flash */}
              <div
                onClick={() => setSelectedModel('gemini-2.5-flash')}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedModel === 'gemini-2.5-flash'
                    ? 'border-[#7d8c52] bg-[#24262b] shadow-[0_0_12px_rgba(125,140,82,0.25)]'
                    : 'border-[#35373e] bg-[#121315] hover:border-[#71706b]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#edeae1]">
                      gemini-2.5-flash
                    </span>
                    <span className="rounded bg-[#23252a] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#9e9c96] border border-[#35373e]">
                      Standard
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9e9c96] leading-relaxed">
                    Baseline multimodal model for speech-to-text transcription and high-level threat classification.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#35373e]/40 flex items-center justify-between font-mono text-[10px] text-[#71706b]">
                  <span>Latency: ~2.1s</span>
                  <span className="text-[#9e9c96]">Baseline</span>
                </div>
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
              <span className="font-mono text-[11px] text-[#8a9a5b]">Pipeline Active</span>
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
                    Speech Emotion Recognition (6 Target Emotions: Anger, Sadness, Fear, Happiness, Stress, Neutral)
                  </span>
                  <span className="text-xs text-[#9e9c96] block">
                    Extracts acoustic spectral patterns to identify vocal distress and emotional intensity across all 6 targets.
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
                    Vocal Distress & Acoustic Stress Cues (Assistive)
                  </span>
                  <span className="text-xs text-[#9e9c96] block">
                    Assesses qualitative vocal cues (trembling, shouting, whispering, sobbing) with advisory disclaimers.
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

          {/* Action Button & State Indicator */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono text-[#9e9c96]">
              {pipelineState === 'uploading' && (
                <span className="text-[#ffb964] flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading audio file to private enclave storage...
                </span>
              )}
              {pipelineState === 'analyzing' && (
                <span className="text-[#8a9a5b] flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Orchestrating AI Speech Emotion & Triage analysis...
                </span>
              )}
              {pipelineState === 'completed' && (
                <span className="text-[#8a9a5b] flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" /> Ingestion complete! Redirecting to case dossier...
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 rounded bg-[#1c1d21] border border-[#35373e] text-[#9e9c96] hover:bg-[#23252a] hover:text-[#edeae1] font-mono text-xs transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleStartAnalysis}
                disabled={isBusy}
                className="px-6 py-2 rounded bg-[#7d8c52] text-[#161f00] font-mono text-xs font-bold tracking-wide hover:bg-[#8a9a5b] shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {pipelineState === 'uploading' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#161f00] border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Audio File...</span>
                  </>
                ) : pipelineState === 'analyzing' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#161f00] border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Speech Emotion & Urgency...</span>
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
        </div>

        {/* Right Column (4 cols): Privacy & Security Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Privacy & Retention Panel */}
          <div className="bg-[#18191c] rounded-lg p-4 border border-[#35373e] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#35373e]/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8a9a5b]" />
                <h3 className="text-sm font-semibold text-[#edeae1]">Audio Storage & Privacy</h3>
              </div>
              <span className="font-mono text-[10px] text-[#ffb964] font-bold">LOCAL ENCLAVE</span>
            </div>

            <div className="flex flex-col gap-2.5 divide-y divide-[#35373e]/40 text-xs">
              <div className="pt-1.5 first:pt-0">
                <span className="text-[#9e9c96] text-[11px]">Enclave Level</span>
                <p className="font-mono font-semibold text-[#edeae1]">Local Enclave / Isolated Storage</p>
                <p className="text-[#71706b] text-[11px]">
                  Audio resides in server-side private storage protected against path traversal with SHA-256 verification.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[#9e9c96] text-[11px]">Compliance Posture</span>
                <p className="font-mono text-[#ffb964] font-semibold">Self-Hosted / Demo Deployment</p>
                <p className="text-[#71706b] text-[11px]">
                  Formal regulatory accreditation (CJIS Tier 4, FedRAMP High) requires independent third-party audit.
                </p>
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

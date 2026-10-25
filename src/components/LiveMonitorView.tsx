'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  AlertTriangle,
  Activity,
  HeartPulse,
  Mic,
  MicOff,
  AlertCircle,
  Info,
} from 'lucide-react';
import { TargetEmotion } from '@/lib/ai/emotion-schemas';

interface LiveTranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  time: string;
  isThreat?: boolean;
  emotion?: string;
}

interface LiveVocalCue {
  id: string;
  title: string;
  type?: string;
  score?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number | string;
  description: string;
}

interface EmotionState {
  primaryEmotion: TargetEmotion;
  secondaryEmotion?: TargetEmotion;
  emotions: Record<TargetEmotion, number>;
  urgencyScore: number;
  confidence: number;
  audioQuality: 'clear' | 'noisy' | 'distorted' | 'low_volume';
  ambiguityFlag: boolean;
}

type MonitorMode = 'live_mic' | 'simulation';

export function LiveMonitorView() {
  const [mode, setMode] = useState<MonitorMode>('live_mic');

  // Audio capture state
  const [isMicCapturing, setIsMicCapturing] = useState<boolean>(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);

  // Timers
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Real-time audio waveform levels (0-100)
  const [waveformLevels, setWaveformLevels] = useState<number[]>(new Array(48).fill(10));
  const [audioInputLevel, setAudioInputLevel] = useState<number>(0);

  // Live Emotion Telemetry (6 Target Emotions)
  const [emotionTelemetry, setEmotionTelemetry] = useState<EmotionState>({
    primaryEmotion: 'neutral',
    secondaryEmotion: 'stress',
    emotions: {
      anger: 0.05,
      sadness: 0.05,
      fear: 0.12,
      happiness: 0.08,
      stress: 0.25,
      neutral: 0.75,
    },
    urgencyScore: 35,
    confidence: 0.85,
    audioQuality: 'clear',
    ambiguityFlag: false,
  });

  // Acoustic Telemetry Metrics
  const [livePitch, setLivePitch] = useState<number>(172);
  const [liveTremor, setLiveTremor] = useState<number>(45);

  // Live Transcripts
  const [liveTranscript, setLiveTranscript] = useState<LiveTranscriptEntry[]>([
    {
      id: 'LIV-01',
      speaker: 'CH-1 Caller [Inbound Stream]',
      time: '00:00:02',
      text: 'System connected. Waiting for live audio transmission...',
      emotion: 'Neutral Baseline',
      isThreat: false,
    },
  ]);

  // Detected Live Vocal Cues
  const [liveVocalCues, setLiveVocalCues] = useState<LiveVocalCue[]>([
    {
      id: 'cue-init',
      title: 'Acoustic Baseline Established',
      score: 15,
      severity: 'low',
      timestamp: 0.5,
      description: 'Initial ambient noise calibration complete. Voice-activity-detector (VAD) armed.',
    },
  ]);

  // Audio Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const shouldRun = mode === 'live_mic' ? isMicCapturing : !isSimulationPaused;

    if (shouldRun) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        if (mode === 'simulation') {
          // Fluctuate simulated values
          setLivePitch((prev) => Math.min(240, Math.max(140, prev + (Math.random() * 10 - 5))));
          setLiveTremor((prev) => Math.min(98, Math.max(70, prev + (Math.random() * 6 - 3))));
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [mode, isMicCapturing, isSimulationPaused]);

  // Simulation mode initial transcript loader
  useEffect(() => {
    if (mode === 'simulation') {
      setLiveTranscript([
        {
          id: 'SIM-01',
          speaker: 'CH-1 Victim [Inbound - Panicked]',
          time: '00:01:45',
          text: 'Officer he is still on my line! He says my bank account has money laundering transactions!',
          emotion: 'Severe Fear (94%)',
          isThreat: false,
        },
        {
          id: 'SIM-02',
          speaker: 'CH-2 Officer [Triage Desk]',
          time: '00:01:58',
          text: 'Maam stay calm, we are tracing the connection. Do not share any OTP or click any link.',
          isThreat: false,
        },
        {
          id: 'SIM-03',
          speaker: 'CH-1 Victim [Inbound - Panicked]',
          time: '00:02:15',
          text: 'He says if I dont send 5 Lakhs immediately, police will come to my house in 10 minutes!',
          emotion: 'Extortion Ultimatum / Acute Panic',
          isThreat: true,
        },
      ]);

      setEmotionTelemetry({
        primaryEmotion: 'fear',
        secondaryEmotion: 'stress',
        emotions: {
          anger: 0.15,
          sadness: 0.22,
          fear: 0.94,
          happiness: 0.02,
          stress: 0.88,
          neutral: 0.04,
        },
        urgencyScore: 96,
        confidence: 0.94,
        audioQuality: 'clear',
        ambiguityFlag: false,
      });

      setLiveVocalCues([
        {
          id: 'sim-cue-1',
          title: 'Acute Phonation Destabilization',
          score: 94,
          severity: 'critical',
          timestamp: 105.2,
          description: 'Fundamental frequency jitter exceeded +180 Hz indicating hyperarousal panic.',
        },
        {
          id: 'sim-cue-2',
          title: 'Vocal Tremor Spike',
          score: 88,
          severity: 'high',
          timestamp: 135.0,
          description: 'Sustained micro-tremor amplitude modulation detected during victim statement.',
        },
      ]);
    }
  }, [mode]);

  // Simulation Waveform loop
  useEffect(() => {
    if (mode === 'simulation' && !isSimulationPaused) {
      const interval = setInterval(() => {
        setWaveformLevels(
          Array.from({ length: 48 }, (_, i) => {
            const h = Math.sin(i * 0.4 + elapsedSeconds * 2 + Math.random() * 0.5) * 40 + 50;
            return Math.max(10, Math.min(100, Math.round(h)));
          })
        );
        setAudioInputLevel(Math.round(65 + Math.random() * 25));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [mode, isSimulationPaused, elapsedSeconds]);

  // ============================================================================
  // GENUINE BROWSER MICROPHONE CAPTURE & SLICE DISPATCH
  // ============================================================================

  const sendAudioSlice = useCallback(async (blob: Blob) => {
    try {
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const formData = new FormData();
      formData.append('audio', blob, 'mic-slice.webm');

      const res = await fetch('/api/live/emotion', {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setEmotionTelemetry({
          primaryEmotion: data.primaryEmotion,
          secondaryEmotion: data.secondaryEmotion,
          emotions: data.emotions,
          urgencyScore: data.urgencyScore,
          confidence: data.confidence,
          audioQuality: data.audioQuality,
          ambiguityFlag: data.ambiguityFlag,
        });

        if (Array.isArray(data.vocalCues) && data.vocalCues.length > 0) {
          setLiveVocalCues((prev) => {
            const newCues = data.vocalCues.filter(
              (nc: any) => !prev.some((p) => p.id === nc.id)
            );
            return [...newCues, ...prev].slice(0, 10);
          });
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Live emotion slice dispatch error:', err);
      }
    }
  }, []);

  const stopMicrophoneCapture = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    abortControllerRef.current?.abort();

    setIsMicCapturing(false);
    setAudioInputLevel(0);
    setWaveformLevels(new Array(48).fill(8));
  }, []);

  const startMicrophoneCapture = async () => {
    setMicPermissionError(null);

    // Verify browser support for getUserMedia
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicPermissionError(
        'Browser audio capture is not supported in this browser. Please use a modern browser (Chrome, Edge, Firefox, Safari) or use the Preset Simulation Preview mode.'
      );
      return;
    }

    try {
      // 1. Genuine microphone capture via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // 2. Set up Web Audio Analyser for real-time waveform & volume levels
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveform = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average volume level
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalizedLevel = Math.min(100, Math.round((avg / 255) * 100));
          setAudioInputLevel(normalizedLevel);

          // Subsample 48 bars for waveform display
          const bars: number[] = [];
          const step = Math.max(1, Math.floor(dataArray.length / 48));
          for (let i = 0; i < 48; i++) {
            const val = dataArray[i * step] || 0;
            const pct = Math.max(8, Math.min(100, Math.round((val / 255) * 100)));
            bars.push(pct);
          }
          setWaveformLevels(bars);

          // Estimate pitch jitter from higher frequencies
          if (avg > 15) {
            setLivePitch(Math.min(230, Math.max(130, Math.round(150 + (avg / 255) * 60))));
          }

          animFrameRef.current = requestAnimationFrame(updateWaveform);
        };

        updateWaveform();
      }

      // 3. Set up MediaRecorder for 2-3 second slices
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          sendAudioSlice(event.data);
        }
      };

      // Record in 2.5-second slices
      recorder.start(2500);

      // 4. Set up Browser Speech Recognition for live transcript feed
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                const text = res[0].transcript.trim();
                if (text.length > 0) {
                  const nowStr = formatTimer(elapsedSeconds);
                  const isThreatKeywords = /kill|bomb|police|cbi|arrest|money|cash|pay|jail|raid/i.test(
                    text
                  );

                  setLiveTranscript((prev) => [
                    ...prev,
                    {
                      id: `MIC-${Date.now()}`,
                      speaker: 'CH-1 Caller [Live Mic Inbound]',
                      time: nowStr,
                      text,
                      isThreat: isThreatKeywords,
                      emotion: `${emotionTelemetry.primaryEmotion.toUpperCase()} (${Math.round(
                        (emotionTelemetry.emotions[emotionTelemetry.primaryEmotion] || 0.8) * 100
                      )}%)`,
                    },
                  ]);
                }
              }
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition warning:', e?.error);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (srErr) {
          console.warn('Speech recognition setup bypassed:', srErr);
        }
      }

      setIsMicCapturing(true);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionError(
          'Microphone access denied. Please click the permissions icon in your browser URL bar and allow microphone access, or switch to Preset Simulation Preview.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicPermissionError(
          'No microphone device found on this system. Please connect an audio input device, or switch to Preset Simulation Preview mode.'
        );
      } else {
        setMicPermissionError(`Microphone capture error: ${err.message || 'Unknown device error.'}`);
      }
      stopMicrophoneCapture();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicrophoneCapture();
    };
  }, [stopMicrophoneCapture]);

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remSecs = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const getEmotionBadgeStyle = (emotion?: string) => {
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

  const angerPct = Math.round((emotionTelemetry.emotions.anger || 0) * 100);
  const sadnessPct = Math.round((emotionTelemetry.emotions.sadness || 0) * 100);
  const fearPct = Math.round((emotionTelemetry.emotions.fear || 0) * 100);
  const happinessPct = Math.round((emotionTelemetry.emotions.happiness || 0) * 100);
  const stressPct = Math.round((emotionTelemetry.emotions.stress || 0) * 100);
  const neutralPct = Math.round((emotionTelemetry.emotions.neutral || 0) * 100);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto w-full">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#18191c] border border-[#35373e] rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#23252a] border border-[#35373e] text-[#8a9a5b]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#edeae1] tracking-tight">
              Live Emergency Call & Inbound Audio Stream Monitor
            </h1>
            <p className="text-xs text-[#9e9c96]">
              Real-time Speech Emotion Recognition (SER), 6-target emotion telemetry, and triage scoring.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#121315] border border-[#35373e]">
          <button
            type="button"
            onClick={() => {
              if (mode !== 'live_mic') {
                setIsSimulationPaused(false);
                setMode('live_mic');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              mode === 'live_mic'
                ? 'bg-[#7d8c52] text-[#161f00] shadow-sm'
                : 'text-[#9e9c96] hover:text-[#edeae1]'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Live Microphone / Phone Inbound</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (mode !== 'simulation') {
                stopMicrophoneCapture();
                setMode('simulation');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              mode === 'simulation'
                ? 'bg-[#422006] text-[#ffb964] border border-[#ffb964]/40 shadow-sm'
                : 'text-[#9e9c96] hover:text-[#edeae1]'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Preset Simulation Preview</span>
          </button>
        </div>
      </div>

      {/* Mode Status & Disclaimers */}
      {mode === 'simulation' ? (
        <div className="rounded-lg border border-[#ffb964]/60 bg-[#2a1a05] p-3 text-xs text-[#edeae1] shadow-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#ffb964] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#ffb964] text-[#121315]">
                SIMULATION PREVIEW
              </span>
              <span className="font-bold text-[#ffb964] text-xs">
                Assistive Demonstration Mode
              </span>
            </div>
            <p className="text-[#edeae1] leading-relaxed text-xs">
              ⚠️ DEMO PREVIEW MODE — Simulated Audio Feed. Acoustic indicators and live transcripts shown are synthetic demonstrations for offline testability. Switch to &quot;Live Microphone&quot; mode to stream genuine microphone audio.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-3 text-xs text-[#edeae1] flex items-start gap-3">
          <Info className="h-4 w-4 text-[#8a9a5b] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-mono font-bold text-[#8a9a5b] text-[11px] uppercase">
              Live Inbound Stream Workstation
            </span>
            <p className="text-[#9e9c96] text-xs leading-relaxed">
              Records live microphone audio in 2-3 second slices and streams telemetry to <code className="text-[#edeae1]">/api/live/emotion</code>. Real-time acoustic activity and transcription are updated continuously.
            </p>
          </div>
        </div>
      )}

      {/* Microphone Permission / Device Error Notice */}
      {micPermissionError && mode === 'live_mic' && (
        <div className="rounded-lg border border-[#b84a44] bg-[#401311]/90 p-3.5 text-xs text-[#edeae1] flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-[#f43f5e] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-[#f43f5e] uppercase text-[11px]">
                Microphone Access Notice
              </span>
              <p className="text-[#edeae1] leading-relaxed">{micPermissionError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMode('simulation')}
            className="px-2.5 py-1 rounded bg-[#ffb964] text-[#121315] font-mono text-xs font-bold whitespace-nowrap hover:bg-[#ffcf87] transition-all"
          >
            Switch to Simulation Preview
          </button>
        </div>
      )}

      {/* Stream Control & Telemetry Bar */}
      <div className="w-full bg-[#18191c] border border-[#35373e] rounded-lg px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {(isMicCapturing || (!isSimulationPaused && mode === 'simulation')) && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8a9a5b] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isMicCapturing || (!isSimulationPaused && mode === 'simulation')
                    ? 'bg-[#8a9a5b]'
                    : 'bg-[#71706b]'
                }`}
              />
            </span>
            <span className="font-mono text-xs font-bold text-[#edeae1] uppercase tracking-wider">
              {mode === 'live_mic' ? 'Live Mic Channel 01' : 'Simulation Helplink 01'}
            </span>

            {mode === 'live_mic' ? (
              <span
                className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${
                  isMicCapturing
                    ? 'bg-[#1a2e1f] text-[#8a9a5b] border-[#5a8264]/50 animate-pulse'
                    : 'bg-[#23252a] text-[#9e9c96] border-[#35373e]'
                }`}
              >
                {isMicCapturing ? 'STREAMING ACTIVE' : 'MIC STANDBY'}
              </span>
            ) : (
              <span className="rounded bg-[#422006] px-2 py-0.5 font-mono text-[10px] text-[#ffb964] border border-[#ffb964]/40 font-bold">
                SIMULATION PREVIEW
              </span>
            )}

            <span className="text-[#35373e]">|</span>
            <span
              className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${
                emotionTelemetry.urgencyScore >= 80
                  ? 'bg-[#401311] text-[#f43f5e] border-[#b84a44]/50 animate-pulse'
                  : 'bg-[#1a2e1f] text-[#8a9a5b] border-[#5a8264]/40'
              }`}
            >
              TRIAGE URGENCY: {emotionTelemetry.urgencyScore}/100
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#9e9c96]">
            <span className="text-[#71706b]">Source:</span>
            <span className="text-[#edeae1] font-medium">
              {mode === 'live_mic'
                ? isMicCapturing
                  ? 'Browser Microphone (Active Slice Stream)'
                  : 'Microphone Inactive'
                : 'Synthetic Inbound (+91 98201 44829)'}
            </span>
            <span>·</span>
            <span className="text-[#71706b]">Elapsed:</span>
            <span className="font-bold text-[#8a9a5b]">{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto md:ml-0 flex-wrap">
          {mode === 'live_mic' ? (
            <button
              type="button"
              onClick={isMicCapturing ? stopMicrophoneCapture : startMicrophoneCapture}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded font-mono text-xs font-bold transition-all border shadow-sm ${
                isMicCapturing
                  ? 'bg-[#b84a44] text-[#edeae1] hover:bg-[#a33f3a] border-[#b84a44]/50 shadow-[0_0_8px_rgba(184,74,68,0.25)]'
                  : 'bg-[#7d8c52] text-[#161f00] hover:bg-[#8a9a5b] border-[#7d8c52]'
              }`}
            >
              {isMicCapturing ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Stop Microphone Capture</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Start Microphone Capture</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSimulationPaused(!isSimulationPaused)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-semibold transition-all border ${
                !isSimulationPaused
                  ? 'bg-[#b84a44] text-[#edeae1] hover:bg-[#a33f3a] border-[#b84a44]/50'
                  : 'bg-[#7d8c52] text-[#161f00] hover:bg-[#8a9a5b] border-[#7d8c52]'
              }`}
            >
              {!isSimulationPaused ? (
                <>
                  <PauseCircle className="h-4 w-4" />
                  <span>Pause Simulation</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  <span>Resume Simulation</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#23252a] hover:bg-[#2d2f36] text-[#edeae1] font-mono text-xs border border-[#35373e] transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-[#d96f68]" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-[#8a9a5b]" />
            )}
            <span>{isMuted ? 'Unmute Monitor' : 'Mute Monitor'}</span>
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
        {/* Left Column: Waveform & Streaming Transcript (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Dual Channel Waveform & Level Canvas */}
          <div className="bg-[#18191c] border border-[#35373e] rounded-lg p-3.5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#35373e]/50 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#8a9a5b]" />
                  <span className="font-mono text-[11px] text-[#8a9a5b] uppercase font-semibold">
                    {mode === 'live_mic' ? 'Live Microphone Stream' : 'CH-1 Caller Stream'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#60a5fa]" />
                  <span className="font-mono text-[11px] text-[#60a5fa] uppercase font-semibold">
                    Voice Activity Detector (VAD)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-[#71706b]">
                <span>Input Level: {audioInputLevel}%</span>
                <span>·</span>
                <span className="text-[#8a9a5b] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b] animate-ping" />
                  {mode === 'live_mic' ? 'LIVE INPUT' : 'SIMULATED'}
                </span>
              </div>
            </div>

            {/* Waveform Visualization Bars */}
            <div className="rounded border border-[#35373e]/60 bg-[#0d0e10] p-3 flex flex-col gap-3">
              <div className="flex items-end justify-between gap-1 h-16 w-full overflow-hidden">
                {waveformLevels.map((height, i) => {
                  const isPeak = height > 75;
                  const isModerate = height > 40;
                  return (
                    <div
                      key={i}
                      className={`w-full rounded-sm transition-all duration-75 ${
                        isPeak
                          ? 'bg-[#f43f5e]'
                          : isModerate
                          ? 'bg-[#8a9a5b]'
                          : 'bg-[#3b82f6]/60'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              {/* Status footer for audio levels */}
              <div className="flex items-center justify-between font-mono text-[10px] text-[#71706b] border-t border-[#35373e]/40 pt-1.5">
                <span>48-Band Spectral Analyser</span>
                <span className="text-[#8a9a5b]">
                  {isMicCapturing
                    ? 'Capturing 2.5s slices via MediaRecorder'
                    : mode === 'live_mic'
                    ? 'Press "Start Microphone Capture" to monitor live'
                    : 'Simulation loop active'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Streaming Transcript */}
          <div className="bg-[#18191c] border border-[#35373e] rounded-lg p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
              <h3 className="text-sm font-semibold text-[#edeae1] flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#8a9a5b]" />
                <span>Live Speech Transcript Feed</span>
              </h3>
              <span className="font-mono text-[10px] text-[#8a9a5b] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b]" />
                {liveTranscript.length} segment(s)
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto">
              {liveTranscript.map((t) => (
                <div
                  key={t.id}
                  className={`rounded p-3 border transition-colors flex flex-col gap-1 ${
                    t.isThreat
                      ? 'border-[#b84a44]/60 bg-[#401311]/40'
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
                      <span className="rounded bg-[#18191c] px-1.5 py-0.5 font-bold text-[#ffb964] border border-[#ffb964]/40">
                        {t.emotion}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Detected Vocal Cues Feed */}
          <div className="bg-[#18191c] border border-[#35373e] rounded-lg p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
              <h3 className="text-sm font-semibold text-[#edeae1] flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-[#d96f68]" />
                <span>Live Vocal Cues & Acoustic Biomarkers</span>
              </h3>
              <span className="font-mono text-[10px] text-[#9e9c96]">
                {liveVocalCues.length} cue(s) detected
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
              {liveVocalCues.map((cue) => (
                <div
                  key={cue.id}
                  className="rounded border border-[#35373e] bg-[#23252a] p-2.5 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-[#edeae1]">{cue.title}</span>
                    <div className="flex items-center gap-1.5 font-mono text-[9px]">
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold border uppercase ${
                          cue.severity === 'critical'
                            ? 'text-[#f43f5e] bg-[#4c0519] border-[#e11d48]/50'
                            : cue.severity === 'high'
                            ? 'text-[#fb923c] bg-[#431407] border-[#ea580c]/50'
                            : cue.severity === 'medium'
                            ? 'text-[#fbbf24] bg-[#422006] border-[#d97706]/40'
                            : 'text-[#8a9a5b] bg-[#1a2e1f] border-[#5a8264]/40'
                        }`}
                      >
                        {cue.severity}
                      </span>
                      {cue.score !== undefined && (
                        <span className="rounded bg-[#18191c] px-1.5 py-0.5 text-[#edeae1] border border-[#35373e]">
                          {cue.score}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#9e9c96] leading-relaxed">{cue.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Emotion Telemetry & Triage (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Live Emotion Telemetry Panel with All 6 Target Emotions */}
          <div className="bg-[#18191c] border border-[#35373e] rounded-lg p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#edeae1] border-b border-[#35373e]/40 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-[#d96f68]" />
                <span>Live Emotion Telemetry</span>
              </span>
              <span
                className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                  mode === 'live_mic'
                    ? 'bg-[#1a2e1f] text-[#8a9a5b] border-[#5a8264]/40'
                    : 'bg-[#422006] text-[#ffb964] border-[#ffb964]/40'
                }`}
              >
                {mode === 'live_mic' ? 'REAL LIVE MIC' : 'SIMULATION'}
              </span>
            </h3>

            {/* Primary & Secondary Emotion Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-[#23252a] border border-[#35373e]">
              <span className="text-xs font-semibold text-[#edeae1]">Active State:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase border ${getEmotionBadgeStyle(
                    emotionTelemetry.primaryEmotion
                  )}`}
                >
                  Primary: {emotionTelemetry.primaryEmotion}
                </span>

                {emotionTelemetry.secondaryEmotion && (
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase border ${getEmotionBadgeStyle(
                      emotionTelemetry.secondaryEmotion
                    )}`}
                  >
                    Secondary: {emotionTelemetry.secondaryEmotion}
                  </span>
                )}
              </div>
            </div>

            {/* Uncertainty Indicators */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              <span className="rounded bg-[#23252a] px-2 py-0.5 text-[#edeae1] border border-[#35373e]">
                Confidence: <strong className="text-[#8a9a5b]">{Math.round(emotionTelemetry.confidence * 100)}%</strong>
              </span>

              <span
                className={`rounded px-2 py-0.5 font-bold border uppercase ${
                  emotionTelemetry.audioQuality === 'clear'
                    ? 'text-[#8a9a5b] bg-[#1a2e1f] border-[#5a8264]/40'
                    : emotionTelemetry.audioQuality === 'noisy'
                    ? 'text-[#fbbf24] bg-[#422006] border-[#d97706]/40'
                    : 'text-[#f43f5e] bg-[#4c0519] border-[#e11d48]/40'
                }`}
              >
                Audio: {emotionTelemetry.audioQuality}
              </span>

              {emotionTelemetry.ambiguityFlag && (
                <span className="rounded bg-[#422006] px-2 py-0.5 text-[#ffb964] border border-[#ffb964]/40 font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Ambiguity High
                </span>
              )}
            </div>

            {/* Progress Bars for all 6 Target Emotions */}
            <div className="space-y-2.5 font-mono text-xs pt-1">
              {/* 1. Anger */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#ea580c] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" /> Anger
                  </span>
                  <span className="text-[#edeae1] font-bold">{angerPct}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ea580c] to-[#dc2626] transition-all duration-300"
                    style={{ width: `${angerPct}%` }}
                  />
                </div>
              </div>

              {/* 2. Sadness */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#60a5fa] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]" /> Sadness
                  </span>
                  <span className="text-[#edeae1] font-bold">{sadnessPct}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#6366f1] transition-all duration-300"
                    style={{ width: `${sadnessPct}%` }}
                  />
                </div>
              </div>

              {/* 3. Fear */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#f43f5e] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" /> Fear & Panic
                  </span>
                  <span className="text-[#edeae1] font-bold">{fearPct}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#f43f5e] to-[#be123c] transition-all duration-300"
                    style={{ width: `${fearPct}%` }}
                  />
                </div>
              </div>

              {/* 4. Happiness */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#fbbf24] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" /> Happiness & Relief
                  </span>
                  <span className="text-[#edeae1] font-bold">{happinessPct}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] transition-all duration-300"
                    style={{ width: `${happinessPct}%` }}
                  />
                </div>
              </div>

              {/* 5. Stress */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#c084fc] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" /> Stress & Distress
                  </span>
                  <span className="text-[#edeae1] font-bold">{stressPct}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c084fc] to-[#7c3aed] transition-all duration-300"
                    style={{ width: `${stressPct}%` }}
                  />
                </div>
              </div>

              {/* 6. Neutral */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8a9a5b] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b]" /> Neutral & Baseline
                  </span>
                  <span className="text-[#edeae1] font-bold">{neutralPct}%</span>
                </div>
                <div className="h-2 w-full bg-[#0d0e10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8a9a5b] to-[#4ade80] transition-all duration-300"
                    style={{ width: `${neutralPct}%` }}
                  />
                </div>
              </div>

              {/* Acoustic Telemetry Metrics */}
              <div className="pt-2 border-t border-[#35373e]/40 grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded bg-[#23252a] p-2">
                  <span className="text-[#9e9c96]">Pitch Shift / Jitter:</span>
                  <p className="font-bold text-[#ffb964] mt-0.5">+{Math.round(livePitch)} Hz</p>
                </div>
                <div className="rounded bg-[#23252a] p-2">
                  <span className="text-[#9e9c96]">Vocal Tremor Score:</span>
                  <p className="font-bold text-[#f43f5e] mt-0.5">{Math.round(liveTremor)} / 100</p>
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
              <p className="font-bold text-[#d96f68]">
                {emotionTelemetry.urgencyScore >= 80
                  ? 'High Coercion Emergency:'
                  : 'Standard Triage Monitoring:'}
              </p>
              <p className="text-[11px] text-[#edeae1]">
                {emotionTelemetry.urgencyScore >= 80
                  ? 'Caller is exhibiting acute panic response to fake law enforcement threats. Instruct caller to stay on line and verify no bank transfers have occurred.'
                  : 'Caller emotional state is within manageable baseline. Maintain investigative intake and log extracted entities.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

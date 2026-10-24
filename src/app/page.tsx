'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { store, isSyntheticCase } from '@/lib/data/store';
import { Case, CallerCategory } from '@/types';
import {
  PhoneCall,
  AlertOctagon,
  HeartPulse,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  User,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function OverviewDashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadedCases = store.getCases();
    setCases(loadedCases);
  }, []);

  const getCategoryBadge = (category?: CallerCategory) => {
    switch (category) {
      case 'distressed_victim':
        return (
          <span className="rounded bg-[#401311] px-2 py-0.5 font-mono text-[11px] font-bold text-[#d96f68] border border-[#b84a44]/50 flex items-center gap-1">
            <HeartPulse className="h-3 w-3" /> Distressed Victim
          </span>
        );
      case 'suspected_fraudster':
        return (
          <span className="rounded bg-[#422006] px-2 py-0.5 font-mono text-[11px] font-bold text-[#ffb964] border border-[#ffb964]/40 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Suspected Fraudster
          </span>
        );
      case 'informant':
        return (
          <span className="rounded bg-[#1a2e1f] px-2 py-0.5 font-mono text-[11px] font-bold text-[#8a9a5b] border border-[#5a8264]/40 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Informant Tip-Off
          </span>
        );
      default:
        return (
          <span className="rounded bg-[#23252a] px-2 py-0.5 font-mono text-[11px] font-medium text-[#9e9c96] border border-[#35373e]">
            Inbound Call
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgencyScore?: number, urgencyLevel?: string) => {
    const score = urgencyScore ?? 50;
    if (score >= 90 || urgencyLevel === 'CRITICAL') {
      return (
        <span className="rounded bg-[#b84a44]/30 px-2.5 py-1 font-mono text-xs font-black text-[#d96f68] border border-[#b84a44] animate-pulse flex items-center gap-1">
          <AlertOctagon className="h-3.5 w-3.5" /> URGENCY: {score}/100 [CRITICAL]
        </span>
      );
    }
    if (score >= 75 || urgencyLevel === 'HIGH') {
      return (
        <span className="rounded bg-[#ffb964]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#ffb964] border border-[#ffb964]/40 flex items-center gap-1">
          URGENCY: {score}/100 [HIGH]
        </span>
      );
    }
    return (
      <span className="rounded bg-[#292a2c] px-2.5 py-1 font-mono text-xs font-medium text-[#8a9a5b] border border-[#35373e] flex items-center gap-1">
        URGENCY: {score}/100 [ROUTINE]
      </span>
    );
  };

  const filteredCalls = cases.filter((c) => {
    if (filterCategory !== 'ALL' && c.callerCategory !== filterCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        (c.callerName && c.callerName.toLowerCase().includes(q)) ||
        (c.callerPhone && c.callerPhone.toLowerCase().includes(q)) ||
        c.docketNumber.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const criticalCount = cases.filter((c) => (c.urgencyScore ?? 0) >= 90).length;
  const victimCount = cases.filter((c) => c.callerCategory === 'distressed_victim').length;
  const fraudsterCount = cases.filter((c) => c.callerCategory === 'suspected_fraudster').length;
  const informantCount = cases.filter((c) => c.callerCategory === 'informant').length;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Title & Rapid Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#35373e]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-[#d96f68] animate-pulse" />
            <h1 className="text-xl md:text-2xl font-bold font-mono text-[#edeae1] tracking-tight">
              Cybercrime Call Triage & Distress Intelligence
            </h1>
          </div>
          <p className="text-xs text-[#9e9c96] mt-1">
            Real-time Speech Emotion Recognition (SER) to identify caller panic, distress, and immediate emergencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/live-monitor"
            className="inline-flex items-center gap-2 rounded bg-[#401311] px-3.5 py-2 font-mono text-xs font-bold text-[#d96f68] border border-[#b84a44]/50 hover:bg-[#5a1c1a] transition-all"
          >
            <Radio className="h-4 w-4" /> Live Call Monitor
          </Link>
          <Link
            href="/new-audio-analysis"
            className="inline-flex items-center gap-2 rounded bg-[#7d8c52] px-3.5 py-2 font-mono text-xs font-bold text-[#161f00] hover:bg-[#8da05a] transition-all"
          >
            <PhoneCall className="h-4 w-4" /> Ingest Call Recording
          </Link>
        </div>
      </div>

      {/* Responsible AI Disclaimer Banner */}
      <div className="rounded border border-[#b87a28]/40 bg-[#b87a28]/10 p-3 text-xs text-[#ffb964] flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 flex-shrink-0 text-[#ffb964] mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong>Mandatory Triage Protocol (Responsible AI):</strong> Emotion recognition is an indicative signal to prioritize callers in acute distress. It is <strong>NOT a lie detector</strong>, guilt metric, or proof of credibility. Final investigative decisions always rest with the officer.
        </div>
      </div>

      {/* Real-time Triage Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#b84a44]/40 bg-[#18191c] p-4 flex flex-col justify-between">
          <span className="font-mono text-xs text-[#9e9c96]">Critical Triage Calls</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-mono text-2xl font-bold text-[#d96f68]">{criticalCount} Calls</span>
            <span className="font-mono text-[10px] text-[#d96f68] font-bold">Needs Immediate Action</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 flex flex-col justify-between">
          <span className="font-mono text-xs text-[#9e9c96]">Distressed Victims</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-mono text-2xl font-bold text-[#edeae1]">{victimCount} Calls</span>
            <span className="font-mono text-[10px] text-[#ffb964]">Fear / Panic Peaks</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 flex flex-col justify-between">
          <span className="font-mono text-xs text-[#9e9c96]">Suspected Fraudsters</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-mono text-2xl font-bold text-[#ffb964]">{fraudsterCount} Calls</span>
            <span className="font-mono text-[10px] text-[#ffb964]">Coercion / Ultimatums</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 flex flex-col justify-between">
          <span className="font-mono text-xs text-[#9e9c96]">Informant Tip-Offs</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-mono text-2xl font-bold text-[#8a9a5b]">{informantCount} Calls</span>
            <span className="font-mono text-[10px] text-[#8a9a5b]">Intelligence Leads</span>
          </div>
        </div>
      </div>

      {/* Priority Inbound Call Triage Queue */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#edeae1] font-mono flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#8a9a5b]" />
                Inbound Call Priority Queue (Ranked by Caller Urgency)
              </h2>
              <p className="text-xs text-[#9e9c96]">
                AI dynamic ranking: attend top critical calls first to intervene in active cyber fraud and psychological coercion.
              </p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[#35373e]/40">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71706b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search caller name, phone, keywords..."
                className="w-full bg-[#121315] border border-[#35373e] text-[#edeae1] placeholder:text-[#71706b] text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#7d8c52]"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto pb-1">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`rounded px-2.5 py-1 border transition-all ${
                  filterCategory === 'ALL'
                    ? 'border-[#8a9a5b] bg-[#7d8c52] text-[#161f00] font-bold'
                    : 'border-[#35373e] bg-[#23252a] text-[#9e9c96]'
                }`}
              >
                All Calls
              </button>
              <button
                onClick={() => setFilterCategory('distressed_victim')}
                className={`rounded px-2.5 py-1 border transition-all ${
                  filterCategory === 'distressed_victim'
                    ? 'border-[#b84a44] bg-[#401311] text-[#d96f68] font-bold'
                    : 'border-[#35373e] bg-[#23252a] text-[#9e9c96]'
                }`}
              >
                Victims
              </button>
              <button
                onClick={() => setFilterCategory('suspected_fraudster')}
                className={`rounded px-2.5 py-1 border transition-all ${
                  filterCategory === 'suspected_fraudster'
                    ? 'border-[#ffb964] bg-[#422006] text-[#ffb964] font-bold'
                    : 'border-[#35373e] bg-[#23252a] text-[#9e9c96]'
                }`}
              >
                Fraudsters
              </button>
              <button
                onClick={() => setFilterCategory('informant')}
                className={`rounded px-2.5 py-1 border transition-all ${
                  filterCategory === 'informant'
                    ? 'border-[#5a8264] bg-[#1a2e1f] text-[#8a9a5b] font-bold'
                    : 'border-[#35373e] bg-[#23252a] text-[#9e9c96]'
                }`}
              >
                Informants
              </button>
            </div>
          </div>
        </div>

        {/* Call Cards List */}
        <div className="space-y-3">
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-[#35373e] bg-[#18191c] text-[#9e9c96] font-mono text-xs">
              No calls currently matching selected criteria.
            </div>
          ) : (
            filteredCalls.map((call) => (
              <div
                key={call.id}
                className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 hover:border-[#8a9a5b]/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Call metadata & Distress highlights */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getUrgencyBadge(call.urgencyScore, call.urgencyLevel)}
                    {getCategoryBadge(call.callerCategory)}
                    {isSyntheticCase(call) && (
                      <span className="rounded bg-[#422006] px-2 py-0.5 font-mono text-[10px] font-bold text-[#ffb964] border border-[#ffb964]/40">
                        SYNTHETIC DEMO
                      </span>
                    )}
                    <span className="font-mono text-xs text-[#9e9c96]">{call.docketNumber}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#edeae1] font-sans">
                      {call.title}
                    </h3>
                    <p className="text-xs text-[#9e9c96] line-clamp-1 mt-0.5">
                      {call.description}
                    </p>
                  </div>

                  {/* Caller Identity & Emotion Profile Breakdown */}
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#9e9c96] pt-1 border-t border-[#35373e]/40">
                    <span>
                      Caller: <strong className="text-[#edeae1]">{call.callerName || 'Anonymous'}</strong>
                    </span>
                    <span>|</span>
                    <span>Phone: <code className="text-[#edeae1]">{call.callerPhone || 'Unlisted'}</code></span>
                    {call.emotionProfile && (
                      <>
                        <span>|</span>
                        <span>
                          Primary Emotion:{' '}
                          <strong className="text-[#d96f68] uppercase font-bold">
                            {call.emotionProfile.primaryEmotion} ({Math.round((call.emotionProfile.emotions[call.emotionProfile.primaryEmotion as keyof typeof call.emotionProfile.emotions] || 0.9) * 100)}%)
                          </strong>
                        </span>
                        {call.emotionProfile.acousticMetrics?.vocalTremorScore && (
                          <>
                            <span>|</span>
                            <span>
                              Tremor: <strong className="text-[#ffb964]">{call.emotionProfile.acousticMetrics.vocalTremorScore}/100</strong>
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Attend Action */}
                <div className="flex md:flex-col items-end gap-2 shrink-0 w-full md:w-auto justify-end">
                  <Link
                    href={`/cases/${call.id}`}
                    className="inline-flex items-center gap-1.5 rounded bg-[#23252a] px-3.5 py-2 font-mono text-xs font-bold text-[#edeae1] border border-[#35373e] hover:bg-[#7d8c52] hover:text-[#161f00] hover:border-[#7d8c52] transition-all"
                  >
                    Open Call Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="font-mono text-[10px] text-[#71706b]">
                    Logged: {new Date(call.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

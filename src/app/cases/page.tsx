'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/data/store';
import { Case, CaseStatus, CallerCategory } from '@/types';
import {
  FolderLock,
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Clock,
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

function CasesContent() {
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCases();
  }, [selectedCategory, searchTerm]);

  const loadCases = () => {
    const res = store.getAllCases({
      callerCategory: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchTerm.trim() || undefined,
    });
    setCases(res.cases);
  };

  const getCategoryBadge = (category?: CallerCategory) => {
    switch (category) {
      case 'distressed_victim':
        return (
          <span className="rounded bg-[#401311] px-2 py-0.5 font-mono text-[10px] font-bold text-[#d96f68] border border-[#b84a44]/50 inline-flex items-center gap-1">
            <HeartPulse className="h-3 w-3" /> Victim
          </span>
        );
      case 'suspected_fraudster':
        return (
          <span className="rounded bg-[#422006] px-2 py-0.5 font-mono text-[10px] font-bold text-[#ffb964] border border-[#ffb964]/40 inline-flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Fraudster
          </span>
        );
      case 'informant':
        return (
          <span className="rounded bg-[#1a2e1f] px-2 py-0.5 font-mono text-[10px] font-bold text-[#8a9a5b] border border-[#5a8264]/40 inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Informant
          </span>
        );
      default:
        return (
          <span className="rounded bg-[#23252a] px-2 py-0.5 font-mono text-[10px] text-[#9e9c96]">
            Call
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgencyScore?: number) => {
    const score = urgencyScore ?? 50;
    if (score >= 90) {
      return (
        <span className="rounded bg-[#b84a44]/30 px-2 py-0.5 font-mono text-[10px] font-black text-[#d96f68] border border-[#b84a44]">
          {score}/100 CRITICAL
        </span>
      );
    }
    if (score >= 75) {
      return (
        <span className="rounded bg-[#ffb964]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#ffb964] border border-[#ffb964]/40">
          {score}/100 HIGH
        </span>
      );
    }
    return (
      <span className="rounded bg-[#292a2c] px-2 py-0.5 font-mono text-[10px] text-[#8a9a5b] border border-[#35373e]">
        {score}/100 ROUTINE
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#35373e]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-mono text-[#edeae1] tracking-tight">
            Cybercrime Call Intake Directory
          </h1>
          <p className="text-xs text-[#9e9c96] mt-0.5">
            Prioritized repository of emergency calls, victim fraud reports, and intercepted suspect communications.
          </p>
        </div>

        <Link
          href="/new-audio-analysis"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#7d8c52] text-[#161f00] hover:bg-[#8a9a5b] transition-all text-xs font-semibold shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Ingest Audio Recording</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#18191c] p-3 rounded-lg border border-[#35373e]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71706b]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search call ID, caller name, phone number, threat..."
            className="w-full bg-[#121315] border border-[#35373e] text-[#edeae1] placeholder:text-[#71706b] text-xs pl-9 pr-3 py-1.5 rounded focus:outline-none focus:border-[#7d8c52]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Calls' },
            { id: 'distressed_victim', label: 'Victims' },
            { id: 'suspected_fraudster', label: 'Fraudsters' },
            { id: 'informant', label: 'Informants' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-[#7d8c52] font-semibold text-[#161f00]'
                  : 'bg-[#23252a] text-[#9e9c96] hover:text-[#edeae1] border border-[#35373e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dockets Grid / Table */}
      <div className="border border-[#35373e] rounded-lg bg-[#1c1d21] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d0e10]/80 border-b border-[#35373e] font-mono text-[11px] text-[#71706b] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 font-medium">Urgency</th>
                <th className="py-3 px-3.5 font-medium">Caller & Category</th>
                <th className="py-3 px-3.5 font-medium">Call Summary</th>
                <th className="py-3 px-3.5 font-medium">Lead Emotion</th>
                <th className="py-3 px-3.5 font-medium">Audio Info</th>
                <th className="py-3 px-3.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#35373e]/50 bg-[#1c1d21]">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#9e9c96] italic">
                    No matching calls found in directory.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#222327] transition-colors">
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {getUrgencyBadge(c.urgencyScore)}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          {getCategoryBadge(c.callerCategory)}
                          <span className="font-semibold text-[#edeae1]">{c.callerName || 'Anonymous'}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#9e9c96]">{c.callerPhone || 'Unlisted'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5 max-w-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#edeae1] line-clamp-1">{c.title}</span>
                        <span className="text-[11px] text-[#9e9c96] line-clamp-1">{c.description}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5 font-mono text-[11px]">
                      {c.emotionProfile ? (
                        <span className="text-[#d96f68] font-bold uppercase">
                          {c.emotionProfile.primaryEmotion} ({Math.round(c.emotionProfile.emotions[c.emotionProfile.primaryEmotion as keyof typeof c.emotionProfile.emotions] * 100)}%)
                        </span>
                      ) : (
                        <span className="text-[#9e9c96]">Analyzing</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono text-[11px] text-[#71706b] whitespace-nowrap">
                      {c.audioMetadata?.durationSeconds
                        ? `${Math.floor(c.audioMetadata.durationSeconds / 60)}:${Math.floor(c.audioMetadata.durationSeconds % 60).toString().padStart(2, '0')}`
                        : '02:30'}{' '}
                      • {c.audioMetadata?.filename || 'Call Audio'}
                    </td>
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/cases/${c.id}`}
                        className="px-2.5 py-1 rounded bg-[#24262b] hover:bg-[#7d8c52] hover:text-[#161f00] text-[#edeae1] font-mono text-[11px] font-medium inline-flex items-center gap-1 border border-[#35373e] transition-colors"
                      >
                        <span>Attend Call</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center font-mono text-xs text-[#9e9c96]">
          Loading cybercrime call repository...
        </div>
      }
    >
      <CasesContent />
    </Suspense>
  );
}

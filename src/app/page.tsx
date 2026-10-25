'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/data/store';
import { Case, CallerCategory } from '@/types';
import {
  Search,
  ArrowRight,
  Radio,
  Phone,
  FileAudio,
  User,
} from 'lucide-react';

export default function OverviewDashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setCases(store.getCases());
  }, []);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryLabel = (category?: CallerCategory | string) => {
    switch (category) {
      case 'distressed_victim':
        return 'Victim Report';
      case 'suspected_fraudster':
        return 'Suspect Audio';
      case 'informant':
        return 'Informant Tip';
      default:
        return 'Audio Recording';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'under_review':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#23252a] text-[#8a9a5b] border border-[#35373e]">
            Under Review
          </span>
        );
      case 'escalated':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#2a221f] text-[#ffb964] border border-[#443228]">
            Escalated
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1c1d21] text-[#71706b] border border-[#2d2f36]">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#23252a] text-[#edeae1] border border-[#35373e]">
            Active
          </span>
        );
    }
  };

  const filteredCases = cases.filter((c) => {
    if (filterCategory !== 'ALL' && c.callerCategory !== filterCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        (c.callerName && c.callerName.toLowerCase().includes(q)) ||
        (c.callerPhone && c.callerPhone.toLowerCase().includes(q)) ||
        c.docketNumber.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const primaryCase = cases[0] ?? null;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2d2f36]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-['Space_Grotesk'] text-[#edeae1] tracking-tight">
            Case Directory
          </h1>
          <p className="text-xs text-[#9e9c96] mt-1">
            Forensic audio case files, transcription records, and active investigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/live-monitor"
            className="inline-flex items-center gap-2 rounded bg-[#23252a] px-3.5 py-2 font-mono text-xs font-medium text-[#edeae1] border border-[#35373e] hover:bg-[#2e3037] transition-colors"
          >
            <Radio className="h-3.5 w-3.5 text-[#8a9a5b]" />
            <span>Live Audio</span>
          </Link>
        </div>
      </div>

      {/* Primary Active Case Spotlight */}
      {primaryCase && (
        <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2d2f36]">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#23252a] text-[#8a9a5b] border border-[#35373e]">
                Primary Active Case
              </span>
              <span className="font-mono text-xs text-[#71706b]">
                {primaryCase.docketNumber || primaryCase.id}
              </span>
            </div>
            {getStatusBadge(primaryCase.status)}
          </div>

          <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <h2 className="text-base font-semibold text-[#edeae1]">
                {primaryCase.title}
              </h2>
              <p className="text-xs text-[#9e9c96] line-clamp-2 max-w-3xl leading-relaxed">
                {primaryCase.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-[#9e9c96]">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#71706b]" />
                  <span>Subject: <strong className="text-[#edeae1] font-normal">{primaryCase.callerName || 'Anonymous'}</strong></span>
                </div>
                {primaryCase.callerPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#71706b]" />
                    <span>Phone: <code className="text-[#edeae1]">{primaryCase.callerPhone}</code></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <FileAudio className="h-3.5 w-3.5 text-[#71706b]" />
                  <span>Duration: <strong className="text-[#edeae1] font-normal">{formatDuration(primaryCase.audioMetadata?.durationSeconds)}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center shrink-0">
              <Link
                href={`/cases/${primaryCase.id}`}
                className="inline-flex items-center gap-2 rounded bg-[#7d8c52] px-4 py-2.5 font-mono text-xs font-bold text-[#161f00] hover:bg-[#8da05a] transition-all shadow-sm"
              >
                <span>Open Case Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cases Directory Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#edeae1] font-['Space_Grotesk']">
            All Case Files ({filteredCases.length})
          </h2>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71706b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, docket, phone..."
                className="w-full sm:w-64 bg-[#18191c] border border-[#2d2f36] text-[#edeae1] placeholder:text-[#71706b] text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#7d8c52]"
              />
            </div>

            <div className="flex items-center gap-1 font-mono text-xs">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'distressed_victim', label: 'Victims' },
                { id: 'suspected_fraudster', label: 'Suspects' },
                { id: 'informant', label: 'Informants' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-2.5 py-1 rounded transition-colors text-xs ${
                    filterCategory === tab.id
                      ? 'bg-[#7d8c52] text-[#161f00] font-semibold'
                      : 'bg-[#18191c] text-[#9e9c96] hover:text-[#edeae1] border border-[#2d2f36]'
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Minimal Case Files Table */}
        <div className="border border-[#2d2f36] rounded-lg bg-[#18191c] overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121315] border-b border-[#2d2f36] font-mono text-[11px] text-[#71706b] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Case ID</th>
                  <th className="py-3 px-4 font-medium">Title & Subject</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Audio Info</th>
                  <th className="py-3 px-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2f36]/60 bg-[#18191c]">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#71706b] font-mono">
                      No case records found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-[#202126] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[#edeae1] whitespace-nowrap">
                        {c.docketNumber || c.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#edeae1] line-clamp-1">
                            {c.title}
                          </span>
                          <span className="text-[11px] text-[#71706b] line-clamp-1">
                            Caller: {c.callerName || 'Anonymous'} {c.callerPhone ? `• ${c.callerPhone}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-[#9e9c96]">
                        {getCategoryLabel(c.callerCategory)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#71706b] whitespace-nowrap">
                        {formatDuration(c.audioMetadata?.durationSeconds)}
                        {c.audioMetadata?.filename ? ` • ${c.audioMetadata.filename}` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/cases/${c.id}`}
                          className="px-2.5 py-1 rounded bg-[#23252a] hover:bg-[#7d8c52] hover:text-[#161f00] text-[#edeae1] font-mono text-[11px] font-medium inline-flex items-center gap-1 border border-[#35373e] transition-colors"
                        >
                          <span>Open Case</span>
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
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { store } from '@/lib/data/store';
import { AuditLogEntry, Case } from '@/types';
import {
  ShieldAlert,
  Clock,
  Activity,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    setLogs(store.getAuditLogs());
    setCases(store.getAllCases({ limit: 100 }).cases);
  }, []);

  const handlePurgeCase = (caseId: string) => {
    if (confirm(`Are you sure you want to permanently purge audio evidence for case ${caseId}? This action is irreversible and will be logged.`)) {
      store.purgeAudio(caseId);
      setLogs(store.getAuditLogs());
      setCases(store.getAllCases({ limit: 100 }).cases);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action.includes(filterAction);
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#121315] text-[#edeae1]">
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Title & Enclave Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#35373e] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#8a9a5b]" />
              <h1 className="text-xl font-bold font-mono tracking-tight text-[#edeae1]">
                Forensic Audit Trail & Retention Enclave
              </h1>
            </div>
            <p className="text-xs text-[#9e9c96] mt-1">
              Immutable chain-of-custody event logging and automated CJIS audio retention management.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded bg-[#23252a] px-2.5 py-1 text-[#8a9a5b] border border-[#35373e]">
              Security Level: TOP SECRET // SCI
            </span>
          </div>
        </div>

        {/* Audio Retention Policy Management Card */}
        <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#35373e]/40 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#ffb964]" />
              <h2 className="text-sm font-semibold text-[#edeae1]">Active Audio Retention Status</h2>
            </div>
            <span className="font-mono text-[11px] text-[#9e9c96]">Policy: Standard 24h Expiration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="rounded bg-[#23252a] p-3 border border-[#35373e]">
              <span className="text-[#9e9c96]">Total Stored Recordings:</span>
              <p className="text-lg font-bold text-[#edeae1] mt-1">
                {cases.filter((c) => c.audioMetadata && !c.audioMetadata.purged).length} Files
              </p>
            </div>
            <div className="rounded bg-[#23252a] p-3 border border-[#35373e]">
              <span className="text-[#9e9c96]">Purged Audio Files:</span>
              <p className="text-lg font-bold text-[#8a9a5b] mt-1">
                {cases.filter((c) => c.audioMetadata?.purged).length} Cleared
              </p>
            </div>
            <div className="rounded bg-[#23252a] p-3 border border-[#35373e]">
              <span className="text-[#9e9c96]">Chain of Custody Events:</span>
              <p className="text-lg font-bold text-[#ffb964] mt-1">{logs.length} Logged</p>
            </div>
          </div>

          {/* Retention Actions Table */}
          <div className="mt-4 overflow-x-auto rounded border border-[#35373e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#23252a] font-mono text-[11px] text-[#9e9c96]">
                <tr>
                  <th className="p-2.5">Docket #</th>
                  <th className="p-2.5">Case Title</th>
                  <th className="p-2.5">Recording File</th>
                  <th className="p-2.5">Audio Status</th>
                  <th className="p-2.5 text-right">Retention Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35373e]/50 font-mono text-[11px]">
                {cases.map((c) => {
                  const isPurged = c.audioMetadata?.purged;
                  return (
                    <tr key={c.id} className="hover:bg-[#23252a]/40">
                      <td className="p-2.5 font-semibold text-[#8a9a5b]">{c.docketNumber}</td>
                      <td className="p-2.5 text-[#edeae1] font-sans text-xs">{c.title}</td>
                      <td className="p-2.5 text-[#9e9c96]">{c.audioMetadata?.filename || 'evidence.wav'}</td>
                      <td className="p-2.5">
                        {isPurged ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[#292a2c] px-2 py-0.5 text-[#9e9c96] border border-[#35373e]">
                            <CheckCircle2 className="h-3 w-3 text-[#8a9a5b]" /> Purged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-[#b87a28]/20 px-2 py-0.5 text-[#ffb964] border border-[#b87a28]/30">
                            <Clock className="h-3 w-3" /> Retained
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        {!isPurged ? (
                          <button
                            onClick={() => handlePurgeCase(c.id)}
                            className="inline-flex items-center gap-1 rounded bg-[#401311] px-2 py-1 text-[10px] font-bold text-[#d96f68] border border-[#b84a44]/50 hover:bg-[#5a1c1a]"
                          >
                            <Trash2 className="h-3 w-3" /> Purge Audio
                          </button>
                        ) : (
                          <span className="text-[#9e9c96] text-[10px]">Purged</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="rounded-lg border border-[#35373e] bg-[#18191c] p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#35373e]/40 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#8a9a5b]" />
              <h2 className="text-sm font-semibold text-[#edeae1]">Custody Event Stream</h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#9e9c96]">Filter:</span>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="rounded border border-[#35373e] bg-[#23252a] px-2.5 py-1 text-xs text-[#edeae1] outline-none"
              >
                <option value="ALL">All Actions</option>
                <option value="SIGN_OFF">Sign Offs</option>
                <option value="PURGED">Audio Purged</option>
                <option value="REVIEW">Reviews</option>
                <option value="BOOTSTRAP">System Bootstrap</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[#35373e]/40">
            {filteredLogs.length === 0 ? (
              <p className="p-4 text-center text-xs text-[#9e9c96] font-mono italic">
                No audit log entries matching criteria.
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#23252a] px-1.5 py-0.5 text-[10px] font-bold text-[#8a9a5b] border border-[#35373e]">
                        {log.action}
                      </span>
                      <span className="text-xs text-[#edeae1] font-sans font-medium">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#9e9c96]">
                      <span>Actor: <strong className="text-[#edeae1]">{log.actorName || log.actorId}</strong></span>
                      <span>Target: <code className="text-[#edeae1]">{log.resourceId}</code></span>
                      <span className="text-[#ffb964]">{log.enclaveSecurityLevel || 'SECRET'}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-[#9e9c96] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  AudioWaveform,
  Radio,
  FolderLock,
  FileText,
  ShieldCheck,
  LogOut,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import ReportModal from './ReportModal';

interface NavItem {
  name: string;
  href: string;
  pathKey: string;
  icon: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeClass?: string;
  isLive?: boolean;
  onClick?: () => void;
}

export function Sidebar() {
  const pathname = usePathname();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedToast, setClearedToast] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleClearSession = () => {
    setShowClearConfirm(false);
    setClearedToast(true);
    setTimeout(() => setClearedToast(false), 3000);
  };

  const navItems: NavItem[] = [
    {
      name: 'Call Triage Queue',
      href: '/',
      pathKey: 'overview',
      icon: LayoutGrid,
      badge: 'LIVE',
      badgeClass: 'text-[#d96f68] font-bold',
    },
    {
      name: 'Live Call Monitor',
      href: '/live-monitor',
      pathKey: 'live-monitor',
      icon: Radio,
      isLive: true,
    },
    {
      name: 'Ingest Call Audio',
      href: '/new-audio-analysis',
      pathKey: 'new-audio-analysis',
      icon: AudioWaveform,
      badge: 'SER',
      badgeClass: 'text-[#71706b]',
    },
    {
      name: 'All Incident Calls',
      href: '/cases',
      pathKey: 'cases',
      icon: FolderLock,
      badge: 'QUEUE',
      badgeClass: 'px-1.5 py-0.5 rounded bg-[#24262b] text-[#8a9a5b] font-mono text-[10px] font-bold border border-[#2d2f36]',
    },
    {
      name: 'Audit & Retention',
      href: '/audit-logs',
      pathKey: 'audit-logs',
      icon: ShieldCheck,
      badge: 'CJIS',
      badgeClass: 'text-[#71706b]',
    },
  ];

  const isActive = (itemHref: string) => {
    if (itemHref === '/') return pathname === '/';
    if (itemHref === '#') return false;
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#18191c] border-r border-[#2d2f36] z-50 flex flex-col justify-between select-none">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="p-4 bg-[#0d0e10]/90 border-b border-[#2d2f36]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded bg-[#1f2022] border border-[#35373e] flex items-center justify-center text-[#8a9a5b] group-hover:border-[#7d8c52] transition-colors">
                <AudioWaveform className="w-5 h-5 text-[#8a9a5b]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Space_Grotesk'] text-[15px] font-bold uppercase tracking-wider text-[#8a9a5b]">
                    VECNAVERSE
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[#9e9c96] tracking-widest uppercase">
                  CYBERCRIME AUDIO INTEL
                </span>
              </div>
            </Link>

            {/* Enclave Status Chip */}
            <div className="mt-3 inline-flex w-full items-center justify-between px-2.5 py-1 rounded bg-[#23252a] border border-[#2d2f36]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8a9a5b] animate-pulse"></span>
                <span className="font-mono text-[10px] text-[#bdce8d] font-bold tracking-wider">
                  ENC-LVL 4 SECURE
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#9e9c96] font-semibold">
                TS//SCI
              </span>
            </div>
          </div>

          {/* Section Tracker */}
          <div className="px-4 py-2 mt-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#71706b]">
              Tactical Consoles
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const IconRight = item.iconRight;

              const content = (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#161f00]' : 'text-[#9e9c96]'}`} />
                    <span className="font-['Space_Grotesk'] text-[13px] tracking-wide">
                      {item.name}
                    </span>
                  </div>

                  {item.isLive ? (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#b84a44]/20 border border-[#b84a44]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d96f68] animate-ping"></span>
                      <span className="font-mono text-[9px] text-[#d96f68] font-bold">LIVE</span>
                    </div>
                  ) : item.badge ? (
                    <span className={`font-mono text-[10px] ${item.badgeClass || ''}`}>
                      {item.badge}
                    </span>
                  ) : IconRight ? (
                    <IconRight className="w-3.5 h-3.5 text-[#71706b]" />
                  ) : null}
                </>
              );

              const className = `flex items-center justify-between px-3 py-2 rounded transition-all text-xs ${
                active
                  ? 'bg-[#7d8c52] text-[#161f00] font-bold shadow-[0_0_8px_rgba(125,140,82,0.35)]'
                  : 'text-[#9e9c96] hover:bg-[#24262b] hover:text-[#edeae1]'
              }`;

              if (item.onClick) {
                return (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={className}
                    type="button"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={className}
                  aria-current={active ? 'page' : undefined}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Engine Telemetry & Clear Session */}
        <div className="p-3 bg-[#0d0e10]/95 border-t border-[#2d2f36] flex flex-col gap-2">
          <div className="p-2.5 rounded bg-[#18191c] border border-[#2d2f36] flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#71706b] tracking-wider uppercase font-semibold">
                ENGINE TELEMETRY
              </span>
              <span className="w-2 h-2 rounded-full bg-[#8a9a5b] animate-pulse"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-[11px] text-[#edeae1] font-semibold">
                AI Engine v4.2.8
              </span>
              <span className="font-mono text-[9px] text-[#8a9a5b]">READY</span>
            </div>
            <span className="font-mono text-[10px] text-[#bdce8d]">
              STT Conformer-XL Active
            </span>
            <div className="mt-1 pt-1.5 border-t border-[#2d2f36] flex items-center justify-between text-[#71706b]">
              <span className="font-mono text-[9px]">CJIS / FedRAMP HIGH</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#8a9a5b]" />
            </div>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#23252a] border border-[#2d2f36] text-[#9e9c96] hover:bg-[#2e3037] hover:text-[#edeae1] hover:border-[#b84a44]/50 transition-colors font-mono text-[11px]"
            type="button"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Clear Session Enclave</span>
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1d21] border border-[#35373e] rounded-lg max-w-md w-full p-5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.65)] flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-[#b84a44]/20 border border-[#b84a44]/40 text-[#d96f68]">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-['Space_Grotesk'] text-base font-semibold text-[#edeae1]">
                  Clear Session Enclave?
                </h3>
                <p className="font-['Inter'] text-xs text-[#9e9c96] mt-1">
                  This will flush cached volatile audio waveforms, temporary speaker scratchpads, and uncommitted officer annotations from your active terminal session.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#121315] border border-[#2d2f36] rounded text-[11px] font-mono text-[#71706b]">
              Encrypted ledger hashes and signed reports remain securely persisted in the CJIS enclave.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded bg-[#23252a] border border-[#2d2f36] text-[#9e9c96] hover:text-[#edeae1] font-mono text-xs transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSession}
                className="px-4 py-1.5 rounded bg-[#b84a44] text-[#edeae1] hover:bg-[#a33f3a] font-mono text-xs font-semibold shadow-sm transition-colors"
                type="button"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {clearedToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1c1d21] border border-[#5a8264] text-[#edeae1] px-4 py-2.5 rounded shadow-xl flex items-center gap-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#5a8264]" />
          <span>Session cache securely purged. Enclave state reset.</span>
        </div>
      )}

      {/* Investigation Dossier Report Modal */}
      {showReportModal && (
        <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
}

export default Sidebar;

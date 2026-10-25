'use client';

import { useState, ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderLock,
  Radio,
  ShieldCheck,
  RotateCcw,
  AudioWaveform,
  CheckCircle2,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export function Sidebar() {
  const pathname = usePathname();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedToast, setClearedToast] = useState(false);

  const handleClearSession = () => {
    setShowClearConfirm(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vecnaverse_cases');
        localStorage.removeItem('vecnaverse_audit');
        localStorage.removeItem('vecnaverse_audit_logs');
      } catch {}
    }
    setClearedToast(true);
    setTimeout(() => {
      setClearedToast(false);
      window.location.reload();
    }, 1000);
  };

  const navItems: NavItem[] = [
    {
      name: 'Cases',
      href: '/cases',
      icon: FolderLock,
    },
    {
      name: 'Live Audio',
      href: '/live-monitor',
      icon: Radio,
    },
    {
      name: 'Audit & Retention',
      href: '/audit-logs',
      icon: ShieldCheck,
    },
  ];

  const isActive = (itemHref: string) => {
    if (itemHref === '/cases') {
      return pathname === '/' || pathname.startsWith('/cases');
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#18191c] border-r border-[#2d2f36] z-50 flex flex-col justify-between select-none">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="p-4 bg-[#0d0e10]/90 border-b border-[#2d2f36]">
            <Link href="/cases" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded bg-[#1f2022] border border-[#35373e] flex items-center justify-center text-[#8a9a5b] group-hover:border-[#7d8c52] transition-colors">
                <AudioWaveform className="w-5 h-5 text-[#8a9a5b]" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-[15px] font-bold uppercase tracking-wider text-[#8a9a5b]">
                  VECNAVERSE
                </span>
                <span className="font-mono text-[9px] text-[#9e9c96] tracking-widest uppercase">
                  Forensic Audio Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Section Label */}
          <div className="px-4 py-2 mt-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#71706b]">
              Navigation
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all text-xs ${
                    active
                      ? 'bg-[#7d8c52] text-[#161f00] font-bold shadow-[0_0_8px_rgba(125,140,82,0.35)]'
                      : 'text-[#9e9c96] hover:bg-[#24262b] hover:text-[#edeae1]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#161f00]' : 'text-[#9e9c96]'}`} />
                  <span className="font-['Space_Grotesk'] text-[13px] tracking-wide">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Reset Session Data */}
        <div className="p-3 bg-[#0d0e10]/95 border-t border-[#2d2f36] flex flex-col gap-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#23252a] border border-[#2d2f36] text-[#9e9c96] hover:bg-[#2e3037] hover:text-[#edeae1] transition-colors font-mono text-xs"
            type="button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session Data</span>
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1d21] border border-[#35373e] rounded-lg max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-[#7d8c52]/10 border border-[#7d8c52]/30 text-[#8a9a5b]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-['Space_Grotesk'] text-base font-semibold text-[#edeae1]">
                  Reset Session Data?
                </h3>
                <p className="font-sans text-xs text-[#9e9c96] mt-1">
                  This will clear locally stored modifications and restore the default case records and audit logs.
                </p>
              </div>
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
                className="px-4 py-1.5 rounded bg-[#7d8c52] text-[#161f00] hover:bg-[#8da05a] font-mono text-xs font-semibold shadow-sm transition-colors"
                type="button"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {clearedToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1c1d21] border border-[#5a8264] text-[#edeae1] px-4 py-2.5 rounded shadow-xl flex items-center gap-2 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#5a8264]" />
          <span>Session data reset successfully.</span>
        </div>
      )}
    </>
  );
}

export default Sidebar;

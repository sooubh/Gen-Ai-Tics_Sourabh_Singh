'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Shield,
  Volume2,
  Bell,
  User,
  AlertTriangle,
  Radio,
  FileCheck,
  X,
} from 'lucide-react';
import { store, isSyntheticCase } from '@/lib/data/store';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if current route is viewing a synthetic case or simulation
  const isCaseDetailPage = pathname?.startsWith('/cases/');
  const currentCaseId = isCaseDetailPage ? pathname.split('/')[2] : null;
  const currentCase = currentCaseId ? store.getCaseById(currentCaseId) : null;
  const isCurrentCaseSynthetic = currentCase ? isSyntheticCase(currentCase) : false;
  const isLiveMonitor = pathname === '/live-monitor';
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Acute Panic & Extortion Flagged',
      caseId: 'CALL-2026-9104',
      time: '1m ago',
      unread: true,
      type: 'threat',
      icon: AlertTriangle,
    },
    {
      id: 'notif-2',
      title: 'Live Monitor: Inbound Helpline Active',
      caseId: 'Live Channel 01',
      time: '3m ago',
      unread: true,
      type: 'live',
      icon: Radio,
    },
    {
      id: 'notif-3',
      title: 'High Distress Call: Pension Wipeout',
      caseId: 'CALL-2026-9051',
      time: '12m ago',
      unread: true,
      type: 'review',
      icon: FileCheck,
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cases?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[#0d0e10]/90 backdrop-blur-xl border-b border-[#2d2f36] z-40 flex items-center justify-between px-5 select-none">
      {/* Search Bar & Active Enclave Chip */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71706b] w-4 h-4 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18191c] text-[#edeae1] placeholder:text-[#71706b] text-xs font-mono pl-9 pr-3 py-1.5 rounded border border-[#2d2f36] focus:outline-none focus:border-[#7d8c52] transition-colors"
            placeholder="Search transcripts, caller names, phone numbers, emergency tags..."
            type="text"
          />
        </form>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#24262b] border border-[#2d2f36] text-[#9e9c96] whitespace-nowrap">
          <Shield className="w-3.5 h-3.5 text-[#8a9a5b]" />
          <span className="font-mono text-[10px] font-bold text-[#edeae1]">ACTIVE ENCLAVE</span>
          <span className="text-[#71706b] text-xs">//</span>
          <span className="font-mono text-[10px] text-[#9e9c96]">METRO CYBER</span>
        </div>

        {isCurrentCaseSynthetic && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#422006] border border-[#ffb964]/50 text-[#ffb964] whitespace-nowrap shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffb964]" />
            <span className="font-mono text-[10px] font-bold tracking-wider">SYNTHETIC DEMO DATA</span>
          </div>
        )}

        {isLiveMonitor && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#422006] border border-[#ffb964]/50 text-[#ffb964] whitespace-nowrap shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffb964]" />
            <span className="font-mono text-[10px] font-bold tracking-wider">SIMULATION PREVIEW</span>
          </div>
        )}
      </div>

      {/* Right Controls: Audio I/O, Notifications, Officer Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18191c] border border-[#2d2f36] text-[#9e9c96]">
          <Volume2 className="w-3.5 h-3.5 text-[#8a9a5b]" />
          <span className="font-mono text-[10px] tracking-wider text-[#9e9c96]">
            AUDIO I/O: <strong className="text-[#8a9a5b] font-medium">LINE-01 OK</strong>
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded hover:bg-[#24262b] text-[#9e9c96] hover:text-[#edeae1] transition-colors"
            title="Notifications"
            type="button"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d96f68] text-[#121315] font-mono text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1c1d21] border border-[#35373e] rounded-lg shadow-[0_8px_24px_-4px_rgba(0,0,0,0.65)] py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2d2f36]">
                <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#edeae1]">
                  Tactical Alerts ({unreadCount})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllRead}
                    className="font-mono text-[10px] text-[#8a9a5b] hover:underline"
                    type="button"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[#71706b] hover:text-[#edeae1]"
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-[#2d2f36]/60 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.caseId.startsWith('CALL-') || n.caseId.startsWith('CY-')) {
                          router.push(`/cases/${n.caseId}`);
                        } else {
                          router.push('/live-monitor');
                        }
                      }}
                      className={`p-3 flex items-start gap-2.5 hover:bg-[#23252a] cursor-pointer transition-colors ${
                        n.unread ? 'bg-[#202126]' : ''
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded ${
                          n.type === 'threat'
                            ? 'bg-[#b84a44]/20 text-[#d96f68]'
                            : n.type === 'live'
                            ? 'bg-[#7d8c52]/20 text-[#8a9a5b]'
                            : 'bg-[#ffb964]/20 text-[#ffb964]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-['Space_Grotesk'] text-xs text-[#edeae1] font-medium">
                          {n.title}
                        </span>
                        <div className="flex items-center justify-between mt-0.5 text-[10px] font-mono text-[#9e9c96]">
                          <span>{n.caseId}</span>
                          <span className="text-[#71706b]">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detective Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#2d2f36]">
          <div className="flex flex-col text-right">
            <span className="font-['Space_Grotesk'] text-[11px] text-[#edeae1] font-semibold leading-tight">
              Det. S. Jenkins #4829
            </span>
            <span className="font-mono text-[9px] text-[#8a9a5b] tracking-wider">
              TOP SECRET // SCI
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#7d8c52] flex items-center justify-center text-[#161f00] font-bold shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

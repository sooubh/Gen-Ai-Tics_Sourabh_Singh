'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  X,
  FileText,
  Radio,
  AlertCircle,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'High Urgency Case: Inbound Extortion Report',
      caseId: 'CALL-2026-9104',
      time: '2m ago',
      unread: true,
      icon: AlertCircle,
    },
    {
      id: 'notif-2',
      title: 'Live Audio Monitor: Stream Available',
      caseId: 'live-monitor',
      time: '5m ago',
      unread: true,
      icon: Radio,
    },
    {
      id: 'notif-3',
      title: 'Review Complete: Pension Wire Fraud',
      caseId: 'CALL-2026-9051',
      time: '15m ago',
      unread: false,
      icon: FileText,
    },
  ]);

  const getCurrentView = () => {
    if (!pathname || pathname === '/' || pathname === '/cases') return 'Cases';
    if (pathname.startsWith('/cases/')) {
      const parts = pathname.split('/');
      return parts[2] ? `Case ${parts[2]}` : 'Case Workspace';
    }
    if (pathname.startsWith('/live-monitor')) return 'Live Audio Monitor';
    if (pathname.startsWith('/audit-logs')) return 'Audit & Retention';
    if (pathname.startsWith('/new-audio-analysis')) return 'Audio Ingestion';
    return 'Workspace';
  };

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
    <header className="fixed top-0 left-72 right-0 h-16 bg-[#0d0e10]/95 backdrop-blur-xl border-b border-[#2d2f36] z-40 flex items-center justify-between px-6 select-none">
      {/* System Title & Current View */}
      <div className="flex items-center gap-3 min-w-[280px]">
        <span className="font-['Space_Grotesk'] text-sm font-bold text-[#edeae1] tracking-wide">
          Forensic Audio Intelligence
        </span>
        <span className="text-[#35373e] font-mono">/</span>
        <span className="font-mono text-xs text-[#8a9a5b] font-medium">
          {getCurrentView()}
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71706b] w-3.5 h-3.5 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18191c] text-[#edeae1] placeholder:text-[#71706b] text-xs font-mono pl-9 pr-3 py-1.5 rounded border border-[#2d2f36] focus:outline-none focus:border-[#7d8c52] transition-colors"
            placeholder="Search cases, transcripts, callers..."
            type="text"
          />
        </form>
      </div>

      {/* Right Controls: Notifications & Active Session Identity */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded hover:bg-[#24262b] text-[#9e9c96] hover:text-[#edeae1] transition-colors"
            title="Notifications"
            type="button"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-[#8a9a5b]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1c1d21] border border-[#35373e] rounded-lg shadow-2xl py-2 z-50">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2d2f36]">
                <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#edeae1]">
                  Case Notifications
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="font-mono text-[10px] text-[#8a9a5b] hover:underline"
                      type="button"
                    >
                      Mark all read
                    </button>
                  )}
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
                        if (n.caseId === 'live-monitor') {
                          router.push('/live-monitor');
                        } else {
                          router.push(`/cases/${n.caseId}`);
                        }
                      }}
                      className={`p-3 flex items-start gap-2.5 hover:bg-[#23252a] cursor-pointer transition-colors ${
                        n.unread ? 'bg-[#202126]' : ''
                      }`}
                    >
                      <div className="p-1.5 rounded bg-[#2a2c31] text-[#8a9a5b]">
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

        {/* Active Session Identity */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#2d2f36]">
          <div className="flex flex-col text-right">
            <span className="font-['Space_Grotesk'] text-xs text-[#edeae1] font-semibold leading-tight">
              Det. S. Jenkins
            </span>
            <span className="font-mono text-[10px] text-[#71706b]">
              ID #4829 • Active Session
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#24262b] border border-[#35373e] flex items-center justify-center text-[#8a9a5b] shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

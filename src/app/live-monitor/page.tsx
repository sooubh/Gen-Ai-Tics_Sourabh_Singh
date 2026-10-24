'use client';

import React from 'react';
import { LiveMonitorView } from '@/components/LiveMonitorView';

export default function LiveMonitorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#121315] text-[#edeae1]">
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <LiveMonitorView />
      </main>
    </div>
  );
}

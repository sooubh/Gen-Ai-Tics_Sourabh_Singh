import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';

export async function GET() {
  try {
    const stats = store.getDashboardStats();
    const hasApiKey = !!process.env.GEMINI_API_KEY;

    return NextResponse.json({
      status: 'OPERATIONAL',
      version: '1.4.0',
      enclave: {
        securityLevel: 'TOP SECRET // SCI',
        cjisCompliant: true,
        isolatedDiskBacking: true,
      },
      aiProvider: {
        provider: 'Google Gemini & Deterministic Synthetic Engine',
        geminiConfigured: hasApiKey,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
        fallbackMode: hasApiKey ? 'hybrid' : 'synthetic_fixtures_only',
      },
      retentionPolicy: {
        defaultExpirationHours: 24,
        allowImmediatePurge: true,
      },
      stats,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve telemetry', details: error.message },
      { status: 500 }
    );
  }
}

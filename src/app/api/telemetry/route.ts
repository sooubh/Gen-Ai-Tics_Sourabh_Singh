import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { store } from '@/lib/data/store';
import { getStorageBaseDir, ensureStorageDir } from '@/lib/storage/private-storage';

export async function GET() {
  try {
    const stats = store.getDashboardStats();
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

    // Verify uploads directory existence and writability (safe on serverless/Vercel)
    let uploadsDir = getStorageBaseDir();
    let uploadsWritable = false;
    let uploadsError: string | null = null;
    try {
      uploadsDir = ensureStorageDir();
      const probeFile = path.join(uploadsDir, `.health-probe-${Date.now()}`);
      fs.writeFileSync(probeFile, 'vecnaverse-probe');
      fs.unlinkSync(probeFile);
      uploadsWritable = true;
    } catch (err: any) {
      uploadsWritable = false;
      uploadsError = err?.message || 'Upload directory unwritable';
    }

    const mem = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    const overallStatus = !uploadsWritable
      ? 'DEGRADED_STORAGE'
      : hasApiKey
      ? 'HEALTHY'
      : 'OPERATIONAL_SYNTHETIC_ONLY';

    return NextResponse.json({
      status: overallStatus,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: uptimeSec,
        memoryUsage: {
          rssMb: Math.round(mem.rss / (1024 * 1024)),
          heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
          heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
        },
      },
      storage: {
        uploadsDirectory: uploadsDir,
        writable: uploadsWritable,
        error: uploadsError,
      },
      compliance: {
        notice: 'Compliance certifications (CJIS Tier 4, FedRAMP, SOC 2, HIPAA) require formal third-party audit and authorization. Development and demo deployments do not possess automatic compliance certification.',
        thirdPartyAudited: false,
        enclaveMode: 'Local / Self-Hosted',
      },
      aiProvider: {
        provider: 'Google Gemini & Deterministic Synthetic Engine',
        geminiConfigured: hasApiKey,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
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

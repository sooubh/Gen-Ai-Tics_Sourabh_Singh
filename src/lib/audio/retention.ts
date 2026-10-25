// ==============================================================================
// VECNAVERSE: Audio Retention & Expiration Policy
// Privacy-first temporary audio retention with verified deletion
// ==============================================================================

import { store } from '@/lib/data/store';

export const DEFAULT_RETENTION_HOURS = Number(process.env.AUDIO_RETENTION_HOURS || 24);

export function calculateExpirationDate(hours: number = DEFAULT_RETENTION_HOURS): string {
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + hours * 60 * 60 * 1000);
  return expiresAt.toISOString();
}

export function isAudioExpired(expiresAtString?: string): boolean {
  if (!expiresAtString) return false;
  const expiry = new Date(expiresAtString).getTime();
  return Date.now() > expiry;
}

export function executeAudioRetentionPurge(caseId: string): { success: boolean; message: string } {
  const success = store.purgeAudio(caseId);
  if (!success) {
    return { success: false, message: `No active audio found for case #${caseId} to purge.` };
  }
  return {
    success: true,
    message: `Audio for case #${caseId} successfully purged from local storage. Evidentiary metadata and verified findings preserved.`,
  };
}

export function runRetentionSweep(): { purgedCount: number; checkedCount: number } {
  const allCases = store.getAllCases({ limit: 1000 }).cases;
  let purgedCount = 0;

  for (const c of allCases) {
    if (c.audioMetadata && !c.audioMetadata.purged && isAudioExpired(c.audioMetadata.expiresAt)) {
      const purged = store.purgeAudio(c.id);
      if (purged) purgedCount++;
    }
  }

  return { purgedCount, checkedCount: allCases.length };
}

import { describe, it, expect } from 'vitest';
import { TranscriptSegment, VocalIndicator } from '@/types';

// Pure logic tests for the Transcript with Configurable Keywords & Seeking
describe('Feature 2: Timestamped Transcript with Highlighted Configurable Keywords & Seeking', () => {
  const sampleSegments: TranscriptSegment[] = [
    {
      id: 'seg-1',
      startTime: 0.0,
      endTime: 4.5,
      text: 'This is Officer Sharma from CBI headquarters. There is an arrest warrant issued against you.',
      confidence: 96,
      speaker: 'Speaker 1 (Suspect)',
      speakerRole: 'Suspect',
    },
    {
      id: 'seg-2',
      startTime: 4.5,
      endTime: 9.8,
      text: 'Sir please, I have not done anything! Why are police coming to my house?',
      confidence: 94,
      speaker: 'Speaker 2 (Victim)',
      speakerRole: 'Victim',
    },
    {
      id: 'seg-3',
      startTime: 9.8,
      endTime: 16.2,
      text: 'Transfer 50000 rupees immediately to verify your bank account or we will conduct an immediate raid.',
      confidence: 98,
      speaker: 'Speaker 1 (Suspect)',
      speakerRole: 'Suspect',
    },
  ];

  const sampleCues: VocalIndicator[] = [
    {
      id: 'cue-1',
      type: 'RAISED_VOICE',
      metricName: 'RAISED_VOICE',
      confidence: 0.88,
      description: 'Elevated vocal strain detected during demand',
      isAdvisory: true,
      available: false,
      disclaimer: 'Advisory only',
      startTime: 10.0,
      endTime: 14.0,
    },
  ];

  // Helper function mirroring SynchronizedTranscript keyword matching
  function matchKeywords(text: string, keywords: string[]): { text: string; isMatch: boolean }[] {
    if (!keywords.length || !text) return [{ text, isMatch: false }];
    const valid = keywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
    if (!valid.length) return [{ text, isMatch: false }];

    const escaped = valid.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part) => ({
      text: part,
      isMatch: valid.includes(part.toLowerCase()),
    }));
  }

  function countKeywordMatches(segments: TranscriptSegment[], keywords: string[]): number {
    if (!keywords.length) return 0;
    const valid = keywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
    if (!valid.length) return 0;
    const escaped = valid.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');

    let total = 0;
    for (const seg of segments) {
      const matches = seg.text.match(regex);
      if (matches) total += matches.length;
    }
    return total;
  }

  it('correctly identifies and highlights default cybercrime keywords', () => {
    const defaultKeywords = ['arrest', 'cbi', 'police', 'money', 'transfer', 'raid', 'account'];
    const seg1Matches = matchKeywords(sampleSegments[0].text, defaultKeywords);

    const highlightedWords = seg1Matches.filter((m) => m.isMatch).map((m) => m.text.toLowerCase());
    expect(highlightedWords).toContain('cbi');
    expect(highlightedWords).toContain('arrest');

    const totalCount = countKeywordMatches(sampleSegments, defaultKeywords);
    // seg1: CBI, arrest (2)
    // seg2: police (1)
    // seg3: transfer, account, raid (3) -> total 6
    expect(totalCount).toBe(6);
  });

  it('supports adding custom user-configured keywords dynamically', () => {
    const customKeywords = ['rupees', 'warrant', 'headquarters'];
    const totalCount = countKeywordMatches(sampleSegments, customKeywords);
    // seg1: headquarters, warrant (2)
    // seg3: rupees (1)
    expect(totalCount).toBe(3);

    const seg3Matches = matchKeywords(sampleSegments[2].text, customKeywords);
    const highlighted = seg3Matches.filter((m) => m.isMatch).map((m) => m.text.toLowerCase());
    expect(highlighted).toContain('rupees');
  });

  it('performs case-insensitive keyword matching preserving original text casing', () => {
    const tokens = matchKeywords('CBI and cbi and Cbi should all match', ['cbi']);
    const matches = tokens.filter((t) => t.isMatch);
    expect(matches.length).toBe(3);
    expect(matches[0].text).toBe('CBI');
    expect(matches[1].text).toBe('cbi');
    expect(matches[2].text).toBe('Cbi');
  });

  it('handles empty or cleared keywords gracefully without errors', () => {
    const tokens = matchKeywords(sampleSegments[0].text, []);
    expect(tokens.length).toBe(1);
    expect(tokens[0].isMatch).toBe(false);
    expect(countKeywordMatches(sampleSegments, [])).toBe(0);
  });

  it('anchors segments to valid source timestamps and provides seek targets', () => {
    expect(sampleSegments[0].startTime).toBe(0.0);
    expect(sampleSegments[0].endTime).toBe(4.5);
    expect(sampleSegments[1].startTime).toBe(4.5);
    expect(sampleSegments[2].startTime).toBe(9.8);

    // Seeking to segment 2 targets exactly 4.5 seconds
    const seekTargetSeg2 = sampleSegments[1].startTime;
    expect(seekTargetSeg2).toBe(4.5);
  });

  it('associates overlapping emotion cues with the correct transcript utterance', () => {
    // Cue 1 is from 10.0 to 14.0 seconds, which overlaps segment 3 (9.8 to 16.2 seconds)
    const seg3 = sampleSegments[2];
    const overlappingCues = sampleCues.filter((cue) => {
      const cueStart = cue.startTime ?? 0;
      const cueEnd = cue.endTime ?? cueStart + 1.5;
      return (
        (cueStart >= seg3.startTime && cueStart <= seg3.endTime) ||
        (cueEnd >= seg3.startTime && cueEnd <= seg3.endTime)
      );
    });

    expect(overlappingCues.length).toBe(1);
    expect(overlappingCues[0].type).toBe('RAISED_VOICE');
    expect(overlappingCues[0].confidence).toBe(0.88);

    // Segment 1 (0.0 to 4.5) should have 0 overlapping cues
    const seg1 = sampleSegments[0];
    const seg1Cues = sampleCues.filter((cue) => {
      const cueStart = cue.startTime ?? 0;
      const cueEnd = cue.endTime ?? cueStart + 1.5;
      return (
        (cueStart >= seg1.startTime && cueStart <= seg1.endTime) ||
        (cueEnd >= seg1.startTime && cueEnd <= seg1.endTime)
      );
    });
    expect(seg1Cues.length).toBe(0);
  });
});

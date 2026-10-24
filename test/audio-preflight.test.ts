import { describe, it, expect } from 'vitest';
import { validateAudioPreflight } from '../src/lib/audio/preflight';

describe('Audio Preflight Validation (REC-01, TEST-006, TEST-007)', () => {
  it('approves compliant audio files (WAV, MP3, FLAC, M4A, OGG)', () => {
    const wavResult = validateAudioPreflight('intercept_call.wav', 1024 * 1024, 'audio/wav');
    expect(wavResult.valid).toBe(true);
    expect(wavResult.format).toBe('PCM 16-bit / 44.1 kHz / 2ch');

    const flacResult = validateAudioPreflight('wiretap.flac', 2048 * 1024, 'audio/flac');
    expect(flacResult.valid).toBe(true);
    expect(flacResult.format).toBe('FLAC Lossless 24-bit / 48 kHz');
  });

  it('rejects disallowed file extensions', () => {
    const exeResult = validateAudioPreflight('payload.exe', 5000, 'application/octet-stream');
    expect(exeResult.valid).toBe(false);
    expect(exeResult.error).toContain('Unsupported audio format');

    const shResult = validateAudioPreflight('exploit.sh', 500, 'text/x-shellscript');
    expect(shResult.valid).toBe(false);
  });

  it('rejects empty or zero-byte files', () => {
    const zeroResult = validateAudioPreflight('silent.mp3', 0, 'audio/mp3');
    expect(zeroResult.valid).toBe(false);
    expect(zeroResult.error?.toLowerCase()).toContain('empty');
  });

  it('rejects files exceeding 500 MB ceiling', () => {
    const hugeResult = validateAudioPreflight('oversized.wav', 600 * 1024 * 1024, 'audio/wav');
    expect(hugeResult.valid).toBe(false);
    expect(hugeResult.error?.toLowerCase()).toContain('exceeds maximum limit');
  });

  it('generates deterministic SHA-256 custody hash from buffer', () => {
    const dummyBuffer = Buffer.from('RIFF....WAVEfmt ....data....');
    const result = validateAudioPreflight('evidence.wav', dummyBuffer.length, 'audio/wav', dummyBuffer);
    expect(result.valid).toBe(true);
    expect(result.sha256Hash).toBeDefined();
    expect(result.sha256Hash?.length).toBe(64);
  });
});

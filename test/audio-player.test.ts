import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AudioPlayer } from '../src/components/AudioPlayer';

describe('AudioPlayer Component State & AudioUrl Handling', () => {
  it('renders audio element with exact src when audioUrl is provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(AudioPlayer, {
        currentTime: 45.5,
        duration: 180,
        isPlaying: false,
        onPlayToggle: () => {},
        onSeek: () => {},
        audioUrl: '/api/upload?path=uploads/audio/evidence_call_102.wav',
        filename: 'evidence_call_102.wav',
        format: '44.1kHz / 16-bit PCM • Mono',
        threatTimestamp: 72.0,
      })
    );

    expect(html).toContain('<audio');
    expect(html).toContain('src="/api/upload?path=uploads/audio/evidence_call_102.wav"');
    expect(html).toContain('evidence_call_102.wav');
    expect(html).toContain('44.1kHz / 16-bit PCM • Mono');
    expect(html).toContain('00:45.500');
    expect(html).toContain('03:00.000');
  });

  it('omits audio element when audioUrl is not provided (falls back to tone generator)', () => {
    const html = renderToStaticMarkup(
      React.createElement(AudioPlayer, {
        currentTime: 0,
        duration: 120,
        isPlaying: false,
        onPlayToggle: () => {},
        onSeek: () => {},
        filename: 'simulated_dispatch.wav',
      })
    );

    expect(html).not.toContain('<audio');
    expect(html).toContain('simulated_dispatch.wav');
    expect(html).toContain('Forensic Audio Stream');
  });

  it('renders Play button when isPlaying is false and Pause button when isPlaying is true', () => {
    const pausedHtml = renderToStaticMarkup(
      React.createElement(AudioPlayer, {
        currentTime: 10,
        duration: 100,
        isPlaying: false,
        onPlayToggle: () => {},
        onSeek: () => {},
      })
    );
    expect(pausedHtml).toContain('title="Play Audio"');

    const playingHtml = renderToStaticMarkup(
      React.createElement(AudioPlayer, {
        currentTime: 10,
        duration: 100,
        isPlaying: true,
        onPlayToggle: () => {},
        onSeek: () => {},
      })
    );
    expect(playingHtml).toContain('title="Pause Audio"');
  });

  it('formats time counters accurately as MM:SS.mmm and handles seek positions', () => {
    const html = renderToStaticMarkup(
      React.createElement(AudioPlayer, {
        currentTime: 125.45, // 02:05.450
        duration: 360,       // 06:00.000
        isPlaying: false,
        onPlayToggle: () => {},
        onSeek: () => {},
      })
    );

    expect(html).toContain('02:05.450');
    expect(html).toContain('06:00.000');
  });

  it('renders threat marker annotation and scrubber position on timeline', () => {
    const threatTime = 95.0; // 01:35
    const html = renderToStaticMarkup(
      React.createElement(AudioPlayer, {
        currentTime: 30,
        duration: 300,
        isPlaying: false,
        onPlayToggle: () => {},
        onSeek: () => {},
        threatTimestamp: threatTime,
      })
    );

    // Threat annotation badge at threat time (01:35)
    expect(html).toContain('THREAT 01:35');
    // Scrubber position at (30 / 300) * 100 = 10%
    expect(html).toContain('left:10%');
  });

  it('renders complete transport control suite and audio adjustments', () => {
    const html = renderToStaticMarkup(
      React.createElement(AudioPlayer, {
        currentTime: 0,
        duration: 60,
        isPlaying: false,
        onPlayToggle: () => {},
        onSeek: () => {},
      })
    );

    expect(html).toContain('title="Rewind 5s"');
    expect(html).toContain('title="Forward 5s"');
    expect(html).toContain('title="Skip Back 10s"');
    expect(html).toContain('title="Skip Forward 10s"');
    expect(html).toContain('Loop CUE');
    expect(html).toContain('0.75x');
    expect(html).toContain('1x');
    expect(html).toContain('1.25x');
    expect(html).toContain('1.5x');
    expect(html).toContain('80%'); // Default volume is 0.8 -> 80%
  });
});

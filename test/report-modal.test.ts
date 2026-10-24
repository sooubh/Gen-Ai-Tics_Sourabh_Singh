import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReportModal } from '../src/components/ReportModal';
import { Case } from '../src/types';

describe('ReportModal Component Verification (PRD-FR-027, Task 1)', () => {
  const mockRealCase: Case = {
    id: 'CASE-2026-5544',
    docketNumber: '#CY-2026-5544',
    title: 'Emergency Digital Arrest Coercion Intercept',
    description: 'Active extortion wiretap recording',
    status: 'under_review',
    priority: 'critical',
    isSyntheticDemo: false,
    callerCategory: 'distressed_victim',
    callerName: 'Aarav Patel (Age 62)',
    callerPhone: '+91 98765 12345',
    urgencyScore: 94,
    urgencyLevel: 'CRITICAL',
    officerId: 'JENKINS-4829',
    officerName: 'Det. S. Jenkins #4829',
    taskForce: 'Cybercrime Rapid Response Unit',
    classificationStandard: 'CJIS Tier 4 Enclave',
    createdAt: '2026-10-24T18:00:00Z',
    updatedAt: '2026-10-24T18:30:00Z',
    audioMetadata: {
      filename: 'INTERCEPT_CALL_5544.wav',
      sizeBytes: 8400000,
      durationSeconds: 154,
      mimeType: 'audio/wav',
      format: 'WAV / PCM 24-bit 48kHz',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadedAt: '2026-10-24T18:00:00Z',
      expiresAt: '2026-10-25T18:00:00Z',
      retentionHours: 24,
      storagePath: '/uploads/audio/INTERCEPT_CALL_5544.wav',
      purged: false,
    },
    entities: [
      {
        id: 'ent-1',
        type: 'BANK_ACCOUNT',
        value: '919876512345',
        normalizedValue: 'SBI-919876512345',
        confidence: 99,
        verificationStatus: 'verified',
      },
      {
        id: 'ent-2',
        type: 'SUSPECT_NAME',
        value: 'DCP Rajesh Kumar',
        normalizedValue: 'Impersonated Official',
        confidence: 88,
        verificationStatus: 'unverified',
      },
    ],
    triggers: [
      {
        id: 'trig-1',
        category: 'EXTORTION',
        severity: 'critical',
        context: 'direct',
        quote: 'Do not disconnect the Skype call or police will reach your home',
        confidence: 96,
        verificationStatus: 'confirmed',
      },
      {
        id: 'trig-2',
        category: 'IMPERSONATION',
        severity: 'high',
        context: 'direct',
        quote: 'This is Crime Branch Headquarters',
        confidence: 91,
        verificationStatus: 'pending',
      },
    ],
    segments: [
      {
        id: 'seg-1',
        speaker: 'Aarav Patel [Victim]',
        startTime: 1.5,
        endTime: 6.2,
        text: 'Please do not arrest me! I have not done anything wrong!',
        confidence: 98,
      },
      {
        id: 'seg-2',
        speaker: 'Extortionist [Impersonator]',
        startTime: 6.8,
        endTime: 12.0,
        text: 'Quiet! Transfer the verification amount immediately.',
        confidence: 95,
      },
    ],
    vocalIndicators: [],
    timeline: [],
  };

  it('renders nothing when isOpen is false or caseData is missing', () => {
    const closedHtml = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: false, onClose: () => {}, caseData: mockRealCase })
    );
    expect(closedHtml).toBe('');

    const nullHtml = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: true, onClose: () => {}, caseData: null })
    );
    expect(nullHtml).toBe('');
  });

  it('renders actual case docket information without inventing data', () => {
    const html = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: true, onClose: () => {}, caseData: mockRealCase })
    );

    // Docket number
    expect(html).toContain('#CY-2026-5544');

    // Incident title
    expect(html).toContain('Emergency Digital Arrest Coercion Intercept');

    // Caller category
    expect(html).toContain('distressed victim');

    // Caller name
    expect(html).toContain('Aarav Patel (Age 62)');

    // Caller phone
    expect(html).toContain('+91 98765 12345');

    // Audio metadata: duration, format, sha256Hash
    expect(html).toContain('2:34'); // 154 seconds = 2:34
    expect(html).toContain('WAV / PCM 24-bit 48kHz');
    expect(html).toContain('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

    // Urgency score
    expect(html).toContain('94/100');
  });

  it('displays verified entities, confirmed emergency triggers, and transcript excerpt', () => {
    const html = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: true, onClose: () => {}, caseData: mockRealCase })
    );

    // Verified entities
    expect(html).toContain('Verified &amp; Extracted Entities');
    expect(html).toContain('1 Verified / 2 Total');
    expect(html).toContain('919876512345');
    expect(html).toContain('SBI-919876512345');
    expect(html).toContain('BANK_ACCOUNT');

    // Confirmed emergency triggers
    expect(html).toContain('Confirmed &amp; Flagged Emergency Triggers');
    expect(html).toContain('1 Confirmed / 2 Total');
    expect(html).toContain('Do not disconnect the Skype call or police will reach your home');
    expect(html).toContain('CONFIRMED');

    // Transcript excerpt
    expect(html).toContain('Synchronized Forensic Transcript Excerpt');
    expect(html).toContain('Aarav Patel [Victim]');
    expect(html).toContain('Please do not arrest me! I have not done anything wrong!');
  });

  it('includes clear statutory disclaimer: "VECNAVERSE is an investigative assistance platform. Speech emotion indicators and AI-extracted triggers are advisory and require officer verification."', () => {
    const html = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: true, onClose: () => {}, caseData: mockRealCase })
    );

    expect(html).toContain(
      'VECNAVERSE is an investigative assistance platform. Speech emotion indicators and AI-extracted triggers are advisory and require officer verification.'
    );
  });

  it('does NOT include demo fixture badge for genuine real cases', () => {
    const html = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: true, onClose: () => {}, caseData: mockRealCase })
    );

    expect(html).not.toContain('DEMO FIXTURE / EVALUATION DATA');
  });

  it('includes "DEMO FIXTURE / EVALUATION DATA" badge in report view for synthetic demo cases', () => {
    const demoCase: Case = {
      ...mockRealCase,
      id: 'CALL-2026-9104',
      isSyntheticDemo: true,
      fixtureId: 'digital-arrest-sunita',
    };

    const html = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: true, onClose: () => {}, caseData: demoCase })
    );

    expect(html).toContain('DEMO FIXTURE / EVALUATION DATA');
  });

  it('provides working action buttons: "Download CSV Export", "Print / Save as PDF", and "Close"', () => {
    const html = renderToStaticMarkup(
      React.createElement(ReportModal, { isOpen: true, onClose: () => {}, caseData: mockRealCase })
    );

    expect(html).toContain('Download CSV Export');
    expect(html).toContain('Print / Save as PDF');
    expect(html).toContain('Close');
  });
});

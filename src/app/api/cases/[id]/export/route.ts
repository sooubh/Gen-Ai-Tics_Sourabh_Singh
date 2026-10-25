import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { escapeCsvField } from '@/lib/export/csv-utils';
import { getServerSession, authorizeCaseAccess } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const caseData = store.getCaseById(id);
    if (!caseData) {
      return NextResponse.json(
        { error: `Case ${id} not found` },
        { status: 404 }
      );
    }

    const session = await getServerSession(request);
    if (session) {
      const authResult = authorizeCaseAccess(session, caseData);
      if (!authResult.authorized) {
        return NextResponse.json(
          { error: authResult.reason || 'Forbidden: Insufficient privileges to export case.' },
          { status: authResult.statusCode || 403 }
        );
      }
    }

    // Genuine docket fields & verification counts
    const docketNumber = caseData.docketNumber || caseData.id;
    const title = caseData.title || '';
    const callerCategory = caseData.callerCategory || 'unknown';
    const status = caseData.status || '';
    const urgencyScore = caseData.urgencyScore ?? caseData.emotionProfile?.urgencyScore ?? 50;

    const verifiedEntitiesCount = (caseData.entities || []).filter(
      (e) =>
        e.verificationStatus === 'verified' ||
        e.verificationStatus === 'confirmed' ||
        e.verificationStatus === 'corrected' ||
        e.status === 'verified'
    ).length;

    const confirmedTriggersCount = (caseData.triggers || []).filter(
      (t) =>
        t.verificationStatus === 'confirmed' ||
        t.verificationStatus === 'verified' ||
        t.verificationStatus === 'corrected' ||
        t.status === 'confirmed'
    ).length;

    const auditOfficer =
      caseData.officerName ||
      caseData.assignedOfficerName ||
      caseData.investigatingOfficer ||
      (caseData.reviews && caseData.reviews.length > 0 ? caseData.reviews[caseData.reviews.length - 1].officerName : '') ||
      session?.user?.name ||
      'Anonymous Officer';

    if (format === 'csv') {
      const rows: string[] = [];

      // CSV Header with genuine fields: docket number, title, caller category, status, urgency score, verified entities count, confirmed triggers count, audit officer
      rows.push(
        [
          'DocketNumber',
          'Title',
          'CallerCategory',
          'Status',
          'UrgencyScore',
          'VerifiedEntitiesCount',
          'ConfirmedTriggersCount',
          'AuditOfficer',
          'OperationName',
          'Category',
          'ItemType',
          'TimeOffset',
          'ContentOrValue',
          'SeverityOrRole',
          'VerificationStatus',
          'VerifiedBy',
        ]
          .map(escapeCsvField)
          .join(',')
      );

      // Dossier case summary row
      rows.push(
        [
          docketNumber,
          title,
          callerCategory,
          status,
          urgencyScore,
          verifiedEntitiesCount,
          confirmedTriggersCount,
          auditOfficer,
          caseData.operationName || '',
          'CASE_SUMMARY',
          'DOSSIER',
          0,
          caseData.description || title,
          caseData.priority || 'medium',
          status,
          auditOfficer,
        ]
          .map(escapeCsvField)
          .join(',')
      );

      // Add entities
      for (const ent of caseData.entities || []) {
        rows.push(
          [
            docketNumber,
            title,
            callerCategory,
            status,
            urgencyScore,
            verifiedEntitiesCount,
            confirmedTriggersCount,
            auditOfficer,
            caseData.operationName || '',
            'ENTITY',
            ent.type,
            ent.evidence?.startTime ?? ent.timestamp ?? '',
            ent.value || ent.text || '',
            ent.normalizedValue || ent.detail || '',
            ent.verificationStatus || ent.status || 'unverified',
            ent.verifiedBy || auditOfficer,
          ]
            .map(escapeCsvField)
            .join(',')
        );
      }

      // Add triggers
      for (const trig of caseData.triggers || []) {
        rows.push(
          [
            docketNumber,
            title,
            callerCategory,
            status,
            urgencyScore,
            verifiedEntitiesCount,
            confirmedTriggersCount,
            auditOfficer,
            caseData.operationName || '',
            'TRIGGER',
            trig.category || trig.type || '',
            trig.evidence?.startTime ?? trig.timestamp ?? trig.timeOffset ?? '',
            trig.quote,
            trig.severity,
            trig.verificationStatus || trig.status || 'unverified',
            trig.verifiedBy || auditOfficer,
          ]
            .map(escapeCsvField)
            .join(',')
        );
      }

      // Add transcript segments
      for (const seg of caseData.segments || []) {
        rows.push(
          [
            docketNumber,
            title,
            callerCategory,
            status,
            urgencyScore,
            verifiedEntitiesCount,
            confirmedTriggersCount,
            auditOfficer,
            caseData.operationName || '',
            'TRANSCRIPT',
            typeof seg.speaker === 'string' ? seg.speaker : seg.speaker?.provisionalLabel || seg.speaker?.speakerId || 'SPEAKER',
            seg.startTime,
            seg.editedText || seg.text,
            seg.threatLabel || '',
            seg.editedBy ? 'edited' : 'original',
            seg.editedBy || auditOfficer,
          ]
            .map(escapeCsvField)
            .join(',')
        );
      }

      // Add vocal indicators / speech emotion recognition metrics
      for (const voc of caseData.vocalIndicators || []) {
        rows.push(
          [
            docketNumber,
            title,
            callerCategory,
            status,
            urgencyScore,
            verifiedEntitiesCount,
            confirmedTriggersCount,
            auditOfficer,
            caseData.operationName || '',
            'VOCAL_INDICATOR',
            voc.type || voc.metricName || 'SER',
            voc.startTime ?? '',
            voc.description || '',
            `Score: ${voc.score ?? ''}`,
            voc.isAdvisory ? 'advisory_only' : 'verified',
            'SPEECH_EMOTION_RECOGNITION',
          ]
            .map(escapeCsvField)
            .join(',')
        );
      }

      const csvContent = rows.join('\r\n');
      const safeDocket = (caseData.docketNumber || caseData.id).replace(/[^a-zA-Z0-9_\-]/g, '_');

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="case-${safeDocket}-dossier.csv"`,
        },
      });
    }

    // Default JSON export
    return NextResponse.json({
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        classification: 'LAW ENFORCEMENT SENSITIVE // REL TO LAW ENFORCEMENT',
        docketNumber,
        title,
        callerCategory,
        status,
        urgencyScore,
        verifiedEntitiesCount,
        confirmedTriggersCount,
        auditOfficer,
      },
      case: caseData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to export case dossier', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';

interface Params {
  params: Promise<{ id: string }>;
}

export function escapeCsvField(val: any): string {
  if (val === undefined || val === null) return '""';
  let str = String(val).replace(/"/g, '""');
  // Formula injection defense (TEST-024 / PRD-FR-027)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
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

    if (format === 'csv') {
      const rows: string[] = [];

      // CSV Header
      rows.push(
        [
          'DocketNumber',
          'CaseTitle',
          'OperationName',
          'Investigator',
          'Status',
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

      // Add entities
      for (const ent of caseData.entities || []) {
        rows.push(
          [
            caseData.docketNumber,
            caseData.title,
            caseData.operationName || '',
            caseData.officerName || '',
            caseData.status,
            'ENTITY',
            ent.type,
            ent.evidence?.startTime ?? ent.timestamp ?? '',
            ent.value || ent.text || '',
            '',
            ent.verificationStatus || 'unverified',
            ent.verifiedBy || '',
          ]
            .map(escapeCsvField)
            .join(',')
        );
      }

      // Add triggers
      for (const trig of caseData.triggers || []) {
        rows.push(
          [
            caseData.docketNumber,
            caseData.title,
            caseData.operationName || '',
            caseData.officerName || '',
            caseData.status,
            'TRIGGER',
            trig.category,
            trig.evidence?.startTime ?? '',
            trig.quote,
            trig.severity,
            trig.verificationStatus || 'unverified',
            trig.verifiedBy || '',
          ]
            .map(escapeCsvField)
            .join(',')
        );
      }

      // Add transcript segments
      for (const seg of caseData.segments || []) {
        rows.push(
          [
            caseData.docketNumber,
            caseData.title,
            caseData.operationName || '',
            caseData.officerName || '',
            caseData.status,
            'TRANSCRIPT',
            typeof seg.speaker === 'string' ? seg.speaker : seg.speaker?.speakerId || 'SPEAKER',
            seg.startTime,
            seg.editedText || seg.text,
            seg.threatLabel || '',
            seg.editedBy ? 'edited' : 'original',
            seg.editedBy || '',
          ]
            .map(escapeCsvField)
            .join(',')
        );
      }

      const csvContent = rows.join('\r\n');

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="case-${caseData.docketNumber}-dossier.csv"`,
        },
      });
    }

    // Default JSON export
    return NextResponse.json({
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        classification: 'LAW ENFORCEMENT SENSITIVE // REL TO LAW ENFORCEMENT',
        docketNumber: caseData.docketNumber,
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

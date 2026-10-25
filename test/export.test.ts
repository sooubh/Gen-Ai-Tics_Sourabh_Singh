import { describe, it, expect, beforeEach } from 'vitest';
import { GET as exportGet } from '../src/app/api/cases/[id]/export/route';
import { escapeCsvField } from '../src/lib/export/csv-utils';
import { store } from '../src/lib/data/store';
import { NextRequest } from 'next/server';

describe('Forensic Export & Formula Injection Defense (PRD-FR-027, TEST-024)', () => {
  it('escapes standard CSV values and strings with quotes', () => {
    expect(escapeCsvField('Operation SafeVault')).toBe('"Operation SafeVault"');
    expect(escapeCsvField('Quote with "inner" quotes')).toBe('"Quote with ""inner"" quotes"');
    expect(escapeCsvField(42)).toBe('"42"');
    expect(escapeCsvField(null)).toBe('""');
    expect(escapeCsvField(undefined)).toBe('""');
  });

  it('neutralizes malicious formula injection characters (=, +, -, @, \\t, \\r, %, |)', () => {
    // Attack payload: =cmd|' /C calc'!A0
    const equalsResult = escapeCsvField("=cmd|' /C calc'!A0");
    expect(equalsResult).toBe("\"'=cmd|' /C calc'!A0\"");

    // Attack payload: +1+1
    const plusResult = escapeCsvField('+1+1');
    expect(plusResult).toBe("\"'+1+1\"");

    // Attack payload: -1-1
    const minusResult = escapeCsvField('-1-1');
    expect(minusResult).toBe("\"'-1-1\"");

    // Attack payload: @SUM(1,1)
    const atResult = escapeCsvField('@SUM(1,1)');
    expect(atResult).toBe("\"'@SUM(1,1)\"");

    // Attack payload with tab / carriage return
    const tabResult = escapeCsvField('\tDDE("cmd";"/C calc";"")');
    expect(tabResult).toBe("\"'\tDDE(\"\"cmd\"\";\"\"/C calc\"\";\"\"\"\")\"");

    const crResult = escapeCsvField('\rDDE("cmd";"/C calc";"")');
    expect(crResult).toBe("\"'\rDDE(\"\"cmd\"\";\"\"/C calc\"\";\"\"\"\")\"");

    // Attack payload with percent (%) and pipe (|)
    const percentResult = escapeCsvField('%0Acmd');
    expect(percentResult).toBe("\"'%0Acmd\"");

    const pipeResult = escapeCsvField('|calc.exe');
    expect(pipeResult).toBe("\"'|calc.exe\"");
  });

  it('neutralizes formula injection characters when preceded by whitespace', () => {
    expect(escapeCsvField('   =cmd|/C calc')).toBe('"\'   =cmd|/C calc"');
    expect(escapeCsvField('  +12345')).toBe('"\'' + '  +12345"');
    expect(escapeCsvField('   -999')).toBe('"\'' + '   -999"');
    expect(escapeCsvField(' \t @SUM(A1:A10)')).toBe('"\' \t @SUM(A1:A10)"');
    expect(escapeCsvField('   |powershell')).toBe('"\'   |powershell"');
    expect(escapeCsvField('  %SYSTEMROOT%')).toBe('"\'  %SYSTEMROOT%"');
  });

  describe('GET /api/cases/[id]/export with genuine fields', () => {
    let testCaseId: string;

    beforeEach(() => {
      const created = store.createCase({
        title: 'Export Validation Test Intercept',
        description: 'Forensic evaluation of export route metadata accuracy',
        callerCategory: 'distressed_victim',
        callerName: 'Sunita Sharma',
        callerPhone: '+91 98111 22233',
        urgencyScore: 92,
        officerName: 'Det. S. Jenkins #4829',
      });
      testCaseId = created.id;

      // Add verified entities, triggers and update status
      store.updateCase(testCaseId, {
        status: 'under_review',
        entities: [
          {
            id: 'ent-1',
            type: 'BANK_ACCOUNT',
            value: '50200012345678',
            confidence: 98,
            verificationStatus: 'verified',
            verifiedBy: 'Det. S. Jenkins #4829',
          },
          {
            id: 'ent-2',
            type: 'SUSPECT_NAME',
            value: 'Inspector Sharma (Impersonator)',
            confidence: 90,
            verificationStatus: 'unverified',
          },
        ],
        triggers: [
          {
            id: 'trig-1',
            category: 'EXTORTION',
            severity: 'critical',
            context: 'direct',
            quote: 'Transfer 50 lakhs now or face digital arrest',
            confidence: 97,
            verificationStatus: 'confirmed',
            verifiedBy: 'Det. S. Jenkins #4829',
          },
          {
            id: 'trig-2',
            category: 'COERCION',
            severity: 'high',
            context: 'direct',
            quote: 'Keep camera on',
            confidence: 85,
            verificationStatus: 'pending',
          },
        ],
      });
    });

    it('includes all genuine fields in the CSV export: docket number, title, caller category, status, urgency score, verified entities count, confirmed triggers count, audit officer', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/export?format=csv`);
      const res = await exportGet(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);

      const csv = await res.text();
      const lines = csv.split('\r\n');
      const header = lines[0];

      // Check header fields
      expect(header).toContain('"DocketNumber"');
      expect(header).toContain('"Title"');
      expect(header).toContain('"CallerCategory"');
      expect(header).toContain('"Status"');
      expect(header).toContain('"UrgencyScore"');
      expect(header).toContain('"VerifiedEntitiesCount"');
      expect(header).toContain('"ConfirmedTriggersCount"');
      expect(header).toContain('"AuditOfficer"');

      // Check summary line with actual data
      const summaryLine = lines[1];
      expect(summaryLine).toContain('Export Validation Test Intercept');
      expect(summaryLine).toContain('distressed_victim');
      expect(summaryLine).toContain('"92"');
      expect(summaryLine).toContain('"1"'); // 1 verified entity
      expect(summaryLine).toContain('Det. S. Jenkins #4829');

      // Check entity line
      expect(csv).toContain('50200012345678');
      expect(csv).toContain('BANK_ACCOUNT');

      // Check trigger line
      expect(csv).toContain('Transfer 50 lakhs now or face digital arrest');
      expect(csv).toContain('EXTORTION');
    });

    it('includes genuine fields in JSON export metadata', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/export?format=json`);
      const res = await exportGet(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.exportMetadata).toBeDefined();
      expect(data.exportMetadata.docketNumber).toBeDefined();
      expect(data.exportMetadata.title).toBe('Export Validation Test Intercept');
      expect(data.exportMetadata.callerCategory).toBe('distressed_victim');
      expect(data.exportMetadata.status).toBe('under_review');
      expect(data.exportMetadata.urgencyScore).toBe(92);
      expect(data.exportMetadata.verifiedEntitiesCount).toBe(1);
      expect(data.exportMetadata.confirmedTriggersCount).toBe(1);
      expect(data.exportMetadata.auditOfficer).toBe('Det. S. Jenkins #4829');
    });
  });
});

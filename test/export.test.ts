import { describe, it, expect } from 'vitest';
import { escapeCsvField } from '../src/app/api/cases/[id]/export/route';

describe('Forensic Export & Formula Injection Defense (PRD-FR-027, TEST-024)', () => {
  it('escapes standard CSV values and strings with quotes', () => {
    expect(escapeCsvField('Operation SafeVault')).toBe('"Operation SafeVault"');
    expect(escapeCsvField('Quote with "inner" quotes')).toBe('"Quote with ""inner"" quotes"');
    expect(escapeCsvField(42)).toBe('"42"');
    expect(escapeCsvField(null)).toBe('""');
    expect(escapeCsvField(undefined)).toBe('""');
  });

  it('neutralizes malicious formula injection characters (=, +, -, @, \\t, \\r)', () => {
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
  });
});

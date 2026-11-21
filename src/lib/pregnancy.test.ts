import { describe, expect, it } from 'vitest';
import {
  babyAgeDays,
  currentPhase,
  dayForWeek,
  dayNumberToIso,
  formatGestation,
  isoToDayNumber,
  isValidIsoDate,
  pregnancyStatus,
  taskDue,
} from './pregnancy';

const at = (iso: string) => new Date(`${iso}T10:00:00`);

describe('pregnancy math', () => {
  it('computes gestational age from the due date (40w = 280 days)', () => {
    const st = pregnancyStatus('2027-01-01', at('2026-11-21'));
    // 41 days before due → 280 - 41 = 239 days = 34+1
    expect(st.daysToDue).toBe(41);
    expect(st.week).toBe(34);
    expect(st.day).toBe(1);
    expect(formatGestation(st)).toBe('34+1');
    expect(st.trimester).toBe(3);
  });

  it('handles the due date itself and going past it', () => {
    expect(pregnancyStatus('2026-11-21', at('2026-11-21'))).toMatchObject({
      week: 40,
      day: 0,
      daysToDue: 0,
      progress: 1,
    });
    expect(pregnancyStatus('2026-11-18', at('2026-11-21'))).toMatchObject({
      week: 40,
      day: 3,
      daysToDue: -3,
      progress: 1,
    });
  });

  it('is not shifted by daylight saving time', () => {
    // Israel moves clocks in late March / late October.
    expect(isoToDayNumber('2026-03-28') - isoToDayNumber('2026-03-26')).toBe(2);
    expect(dayNumberToIso(isoToDayNumber('2026-10-25'))).toBe('2026-10-25');
  });

  it('validates ISO dates', () => {
    expect(isValidIsoDate('2026-02-28')).toBe(true);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('21/11/2026')).toBe(false);
    expect(isValidIsoDate(null)).toBe(false);
  });

  it('places week N at due − 280 + 7N', () => {
    expect(dayForWeek('2027-01-01', 40)).toBe(isoToDayNumber('2027-01-01'));
    expect(dayForWeek('2027-01-01', 36)).toBe(isoToDayNumber('2026-12-04'));
  });

  it('computes when a task is due', () => {
    const h = { dueDate: '2027-01-01', birthDate: null };
    expect(taskDue({ dueWeek: 36, dueDaysAfterBirth: null }, h)).toEqual({
      day: isoToDayNumber('2026-12-10'), // end of week 36
      estimated: false,
    });
    expect(taskDue({ dueWeek: null, dueDaysAfterBirth: 14 }, h)).toEqual({
      day: isoToDayNumber('2027-01-15'),
      estimated: true,
    });
    expect(
      taskDue({ dueWeek: null, dueDaysAfterBirth: 14 }, { dueDate: '2027-01-01', birthDate: '2026-12-25' }),
    ).toEqual({
      day: isoToDayNumber('2027-01-08'),
      estimated: false,
    });
    expect(taskDue({ dueWeek: null, dueDaysAfterBirth: null }, h)).toBeNull();
    expect(taskDue({ dueWeek: 30, dueDaysAfterBirth: null }, { dueDate: null, birthDate: null })).toBeNull();
  });

  it('knows the current phase', () => {
    expect(currentPhase({ dueDate: '2027-03-01', birthDate: null }, at('2026-11-21'))).toBe('pregnancy');
    expect(currentPhase({ dueDate: '2027-01-01', birthDate: null }, at('2026-11-21'))).toBe('prebirth');
    expect(currentPhase({ dueDate: '2027-01-01', birthDate: '2026-11-20' }, at('2026-11-21'))).toBe('hospital');
    expect(currentPhase({ dueDate: '2027-01-01', birthDate: '2026-11-01' }, at('2026-11-21'))).toBe('firstWeeks');
    expect(currentPhase({ dueDate: '2027-01-01', birthDate: '2026-08-01' }, at('2026-11-21'))).toBe('firstMonths');
    expect(babyAgeDays('2026-11-14', at('2026-11-21'))).toBe(7);
  });
});

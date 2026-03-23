import { describe, it, expect } from 'vitest';
import {
  getDaySlots,
  getEventPosition,
  getPillVariant,
  getPillState,
  getVisibleEvents,
  formatTime,
  formatMonthMeta,
  formatRangeMeta,
  getStateColor,
  getGoogleColorState,
} from './utils';
import type { CalendarEvent } from './utils';

describe('getDaySlots', () => {
  const today = new Date('2026-03-14T12:00:00');

  it('returns 11 day slots: 3 past + today + 7 future', () => {
    const slots = getDaySlots([], today);
    expect(slots).toHaveLength(11);
    expect(slots[0].status).toBe('past');
    expect(slots[1].status).toBe('past');
    expect(slots[2].status).toBe('past');
    expect(slots[3].status).toBe('today');
    for (let i = 4; i < 11; i++) {
      expect(slots[i].status).toBe('future');
    }
  });

  it('assigns correct day names and numbers', () => {
    const slots = getDaySlots([], today);
    expect(slots[3].dayName).toBe('Sat');
    expect(slots[3].dayNum).toBe(14);
  });

  it('distributes events into matching day slots', () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'A', start: '2026-03-14T10:00:00', end: '2026-03-14T11:00:00', allDay: false, location: null },
      { id: '2', title: 'B', start: '2026-03-15T10:00:00', end: '2026-03-15T11:00:00', allDay: false, location: null },
    ];
    const slots = getDaySlots(events, today);
    expect(slots[3].events).toHaveLength(1);
    expect(slots[4].events).toHaveLength(1);
  });

  it('ignores events outside the 7-day window', () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'Old', start: '2026-03-01T10:00:00', end: '2026-03-01T11:00:00', allDay: false, location: null },
    ];
    const slots = getDaySlots(events, today);
    const total = slots.reduce((sum, s) => sum + s.events.length, 0);
    expect(total).toBe(0);
  });

  it('distributes multi-day all-day events across all spanned days', () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'Conference', start: '2026-03-13', end: '2026-03-16', allDay: true, location: null },
    ];
    const slots = getDaySlots(events, today);
    // Mar 13 (past, slot 2), Mar 14 (today, slot 3), Mar 15 (future, slot 4) — end date Mar 16 is exclusive
    expect(slots[2].events).toHaveLength(1);
    expect(slots[3].events).toHaveLength(1);
    expect(slots[4].events).toHaveLength(1);
    expect(slots[5].events).toHaveLength(0); // Mar 16 — end date is exclusive
  });
});

describe('getPillVariant', () => {
  const now = new Date('2026-03-14T10:30:00');

  it('returns "full" when event is happening now', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '2026-03-14T10:00:00', end: '2026-03-14T11:00:00', allDay: false, location: null };
    expect(getPillVariant(event, now)).toBe('full');
  });

  it('returns "full" when event is overdue (ended, same day)', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '2026-03-14T08:00:00', end: '2026-03-14T09:00:00', allDay: false, location: null };
    expect(getPillVariant(event, now)).toBe('full');
  });

  it('returns "full" when event is flagged critical', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '2026-03-15T10:00:00', end: '2026-03-15T11:00:00', allDay: false, location: null, isCritical: true };
    expect(getPillVariant(event, now)).toBe('full');
  });

  it('returns "glass" for future non-critical event', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '2026-03-15T10:00:00', end: '2026-03-15T11:00:00', allDay: false, location: null };
    expect(getPillVariant(event, now)).toBe('glass');
  });

  it('returns "full" for all-day events', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '2026-03-14', end: '2026-03-15', allDay: true, location: null };
    expect(getPillVariant(event, now)).toBe('full');
  });
});

describe('getPillState', () => {
  it('returns "critical" when isCritical is true', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '', end: '', allDay: false, location: null, isCritical: true, color: '#34A853' };
    expect(getPillState(event)).toBe('critical');
  });

  it('returns neutral for timed events without critical flag', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '', end: '', allDay: false, location: null, color: '#34A853' };
    expect(getPillState(event)).toBe('neutral');
  });

  it('returns neutral when no color and not all-day', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '', end: '', allDay: false, location: null };
    expect(getPillState(event)).toBe('neutral');
  });

  it('returns info for all-day events', () => {
    const event: CalendarEvent = { id: '1', title: 'A', start: '2026-03-14', end: '2026-03-15', allDay: true, location: null };
    expect(getPillState(event)).toBe('info');
  });
});

describe('getVisibleEvents', () => {
  const mkEvent = (id: string, isCritical = false): CalendarEvent => ({
    id, title: `Event ${id}`, start: '', end: '', allDay: false, location: null, isCritical,
  });

  it('returns all events when under max', () => {
    const events = [mkEvent('1'), mkEvent('2')];
    const result = getVisibleEvents(events, 3);
    expect(result.visible).toHaveLength(2);
    expect(result.overflowCount).toBe(0);
  });

  it('limits to maxVisible and reports overflow', () => {
    const events = [mkEvent('1'), mkEvent('2'), mkEvent('3'), mkEvent('4')];
    const result = getVisibleEvents(events, 2);
    expect(result.visible).toHaveLength(2);
    expect(result.overflowCount).toBe(2);
  });

  it('always includes critical events, pushing non-critical to overflow', () => {
    const events = [mkEvent('1'), mkEvent('2'), mkEvent('3', true)];
    const result = getVisibleEvents(events, 2);
    expect(result.visible.some(e => e.id === '3')).toBe(true);
    expect(result.visible).toHaveLength(2);
    expect(result.overflowCount).toBe(1);
  });
});

describe('formatTime', () => {
  it('returns "All day" for all-day events', () => {
    expect(formatTime('2026-03-14', true)).toBe('All day');
  });

  it('returns HH:MM for timed events', () => {
    const result = formatTime('2026-03-14T09:30:00', false);
    expect(result).toBe('09:30');
  });
});

describe('formatMonthMeta', () => {
  it('returns "Month YYYY" format', () => {
    expect(formatMonthMeta(new Date('2026-03-14'))).toBe('March 2026');
  });
});

describe('formatRangeMeta', () => {
  it('returns "Mon DD-DD" range for 3 days starting from today', () => {
    const slots = getDaySlots([], new Date('2026-03-14T12:00:00'));
    expect(formatRangeMeta(slots)).toBe('Mar 14\u201317');
  });
});

describe('getStateColor', () => {
  it('returns CSS variable for known states', () => {
    expect(getStateColor('positive')).toBe('var(--dash-state-positive)');
    expect(getStateColor('info')).toBe('var(--dash-state-info)');
    expect(getStateColor('warning')).toBe('var(--dash-state-warning)');
    expect(getStateColor('critical')).toBe('var(--dash-state-critical)');
  });

  it('returns rgba for neutral', () => {
    expect(getStateColor('neutral')).toBe('rgba(255, 255, 255, 0.2)');
  });
});

describe('getGoogleColorState', () => {
  it('maps red/tomato to critical', () => {
    expect(getGoogleColorState('#DC2626')).toBe('critical');
    expect(getGoogleColorState('#E67C73')).toBe('critical');
  });

  it('maps yellow/tangerine to warning', () => {
    expect(getGoogleColorState('#F4B400')).toBe('warning');
    expect(getGoogleColorState('#F09300')).toBe('warning');
  });

  it('maps green/sage/basil to positive', () => {
    expect(getGoogleColorState('#33B679')).toBe('positive');
    expect(getGoogleColorState('#0B8043')).toBe('positive');
    expect(getGoogleColorState('#34A853')).toBe('positive');
  });

  it('maps blue/lavender/grape to info', () => {
    expect(getGoogleColorState('#039BE5')).toBe('info');
    expect(getGoogleColorState('#4285F4')).toBe('info');
    expect(getGoogleColorState('#7986CB')).toBe('info');
    expect(getGoogleColorState('#8E24AA')).toBe('info');
  });

  it('maps graphite to neutral', () => {
    expect(getGoogleColorState('#616161')).toBe('neutral');
  });

  it('returns neutral for unknown colors', () => {
    expect(getGoogleColorState('#FF00FF')).toBe('neutral');
  });
});

describe('getEventPosition', () => {
  const START = 7;
  const END   = 22;
  const PPH   = 48; // px per hour

  const mkEvent = (start: string, end: string): CalendarEvent => ({
    id: '1', title: 'T', start, end, allDay: false, location: null,
  });

  it('positions an event at the correct top offset', () => {
    // 9:00 AM = 2 hours after 7 AM = 96px
    const ev = mkEvent('2026-03-14T09:00:00', '2026-03-14T10:00:00');
    const pos = getEventPosition(ev, START, END, PPH);
    expect(pos.top).toBe(96);
  });

  it('calculates height from duration', () => {
    // 1 hour = 48px
    const ev = mkEvent('2026-03-14T09:00:00', '2026-03-14T10:00:00');
    expect(getEventPosition(ev, START, END, PPH).height).toBe(48);
  });

  it('enforces minimum height of 20px for short events', () => {
    // 15-minute event = 12px, clamped to 20px
    const ev = mkEvent('2026-03-14T09:00:00', '2026-03-14T09:15:00');
    expect(getEventPosition(ev, START, END, PPH).height).toBe(20);
  });

  it('clamps events that start before startHour to top: 0', () => {
    const ev = mkEvent('2026-03-14T06:00:00', '2026-03-14T08:00:00');
    expect(getEventPosition(ev, START, END, PPH).top).toBe(0);
  });

  it('clamps events that end after endHour', () => {
    // Start at 21:00 (14 hours * 48 = 672px), end clamped at 22:00 (720px)
    const ev = mkEvent('2026-03-14T21:00:00', '2026-03-14T23:00:00');
    const pos = getEventPosition(ev, START, END, PPH);
    expect(pos.top).toBe(672);
    expect(pos.height).toBe(48); // 1 hour from 21:00 to clamped 22:00
  });

  it('handles half-hour start times', () => {
    // 9:30 AM = 2.5 hours * 48 = 120px
    const ev = mkEvent('2026-03-14T09:30:00', '2026-03-14T10:00:00');
    expect(getEventPosition(ev, START, END, PPH).top).toBe(120);
  });
});

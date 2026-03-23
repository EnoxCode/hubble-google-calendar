let mockData: unknown = null;
let mockConfig: unknown = {};

vi.mock('hubble-sdk', () => ({
  useConnectorData: () => mockData,
  useWidgetConfig: () => mockConfig,
}));

import Calendar from './index';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CalendarEvent, DaySlot } from './utils';
import { CalendarXL } from './CalendarXL';
import { CalendarL } from './CalendarL';
import { CalendarM } from './CalendarM';
import { CalendarS } from './CalendarS';
import { CalendarVertical } from './CalendarVertical';

function makeDaySlots(overrides?: Partial<DaySlot>[]): DaySlot[] {
  const base: DaySlot[] = [
    { date: new Date('2026-03-11'), dayName: 'Wed', dayNum: 11, status: 'past',   events: [] },
    { date: new Date('2026-03-12'), dayName: 'Thu', dayNum: 12, status: 'past',   events: [] },
    { date: new Date('2026-03-13'), dayName: 'Fri', dayNum: 13, status: 'past',   events: [] },
    { date: new Date('2026-03-14'), dayName: 'Sat', dayNum: 14, status: 'today',  events: [] },
    { date: new Date('2026-03-15'), dayName: 'Sun', dayNum: 15, status: 'future', events: [] },
    { date: new Date('2026-03-16'), dayName: 'Mon', dayNum: 16, status: 'future', events: [] },
    { date: new Date('2026-03-17'), dayName: 'Tue', dayNum: 17, status: 'future', events: [] },
    { date: new Date('2026-03-18'), dayName: 'Wed', dayNum: 18, status: 'future', events: [] },
    { date: new Date('2026-03-19'), dayName: 'Thu', dayNum: 19, status: 'future', events: [] },
    { date: new Date('2026-03-20'), dayName: 'Fri', dayNum: 20, status: 'future', events: [] },
    { date: new Date('2026-03-21'), dayName: 'Sat', dayNum: 21, status: 'future', events: [] },
  ];
  if (overrides) {
    overrides.forEach((o, i) => { if (o) Object.assign(base[i], o); });
  }
  return base;
}

const now = new Date('2026-03-14T12:00:00');

describe('CalendarXL', () => {
  it('renders the time-grid body container', () => {
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    expect(container.querySelector('.cal-tg-body')).not.toBeNull();
  });

  it('renders exactly 7 day columns starting from today (no past days)', () => {
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    expect(container.querySelectorAll('.cal-tg-col')).toHaveLength(7);
    // First column header should be today's day name (Sat) and number (14)
    const headers = container.querySelectorAll('.cal-tg-header-cell');
    expect(headers[0]).toHaveClass('cal-tg-header-cell--today');
    expect(headers[0].textContent).toContain('14');
  });

  it('renders 7 day header cells', () => {
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    expect(container.querySelectorAll('.cal-tg-header-cell')).toHaveLength(7);
  });

  it('renders time label slots for each hour (7 AM to 10 PM = 15 labels)', () => {
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    expect(container.querySelectorAll('.cal-tg-slot')).toHaveLength(15);
  });

  it('renders a timed event as .cal-tg-event in the correct day column', () => {
    const event: CalendarEvent = {
      id: '1', title: 'Standup', start: '2026-03-14T09:00:00', end: '2026-03-14T10:00:00',
      allDay: false, location: null,
    };
    // today is index 3 in makeDaySlots; CalendarXL slices from there
    const days = makeDaySlots([undefined, undefined, undefined, { events: [event] }]);
    const { container } = render(<CalendarXL days={days} now={now} />);
    expect(container.querySelector('.cal-tg-event')).not.toBeNull();
    expect(screen.getByText('Standup')).toBeInTheDocument();
  });

  it('renders an all-day event as a pill in the all-day strip, not the time grid', () => {
    const event: CalendarEvent = {
      id: '1', title: 'Team Offsite', start: '2026-03-14', end: '2026-03-15',
      allDay: true, location: null,
    };
    const days = makeDaySlots([undefined, undefined, undefined, { events: [event] }]);
    const { container } = render(<CalendarXL days={days} now={now} />);
    // All-day pill lives inside the allday strip
    const strip = container.querySelector('.cal-tg-allday-row');
    expect(strip).not.toBeNull();
    expect(strip!.textContent).toContain('Team Offsite');
    // Must NOT appear as a .cal-tg-event in the time grid
    expect(container.querySelector('.cal-tg-event')).toBeNull();
  });

  it("renders the now indicator in today's column when within time range", () => {
    // now = 12:00 which is within 7 AM–10 PM
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    const todayCol = container.querySelectorAll('.cal-tg-col')[0]; // today is first column
    expect(todayCol.querySelector('.cal-tg-now-line')).not.toBeNull();
  });

  it('does not render the now indicator when now is outside the time range', () => {
    const earlyNow = new Date('2026-03-14T05:00:00'); // before 7 AM
    const { container } = render(<CalendarXL days={makeDaySlots()} now={earlyNow} />);
    expect(container.querySelector('.cal-tg-now-line')).toBeNull();
  });

  it('does not render a timed event that ends before START_HOUR (7 AM)', () => {
    const earlyEvent: CalendarEvent = {
      id: '1', title: 'Early Call', start: '2026-03-14T05:00:00', end: '2026-03-14T06:30:00',
      allDay: false, location: null,
    };
    const days = makeDaySlots([undefined, undefined, undefined, { events: [earlyEvent] }]);
    const { container } = render(<CalendarXL days={days} now={now} />);
    expect(container.querySelector('.cal-tg-event')).toBeNull();
  });
});

describe('CalendarL', () => {
  it('renders 7 day columns with cal-grid--compact class', () => {
    const { container } = render(<CalendarL days={makeDaySlots()} now={now} />);
    expect(container.querySelector('.cal-grid--compact')).not.toBeNull();
    expect(container.querySelectorAll('.cal-day')).toHaveLength(7);
  });

  it('renders past events as DashPill.Dot with event title', () => {
    const event: CalendarEvent = {
      id: '1', title: 'Standup', start: '2026-03-11T09:00:00', end: '2026-03-11T09:15:00',
      allDay: false, location: null, color: '#4285F4',
    };
    const days = makeDaySlots([{ events: [event] }]);
    const { container } = render(<CalendarL days={days} now={now} />);
    expect(container.querySelector('.dash-pill-dot')).not.toBeNull();
    expect(screen.getByText('Standup')).toBeInTheDocument();
  });

  it('renders critical today event as full pill even in compact mode', () => {
    const event: CalendarEvent = {
      id: '1', title: 'Tax', start: '2026-03-14T00:00:00', end: '2026-03-14T23:59:59',
      allDay: true, location: null, isCritical: true,
    };
    const days = makeDaySlots([undefined, undefined, undefined, { events: [event] }]);
    const { container } = render(<CalendarL days={days} now={now} />);
    expect(container.querySelector('.dash-pill--full')).not.toBeNull();
    expect(screen.getByText('Tax')).toBeInTheDocument();
  });
});

describe('CalendarM', () => {
  it('renders 3 columns starting from today', () => {
    const { container } = render(<CalendarM days={makeDaySlots()} now={now} />);
    expect(container.querySelector('.cal-grid--3col')).not.toBeNull();
    expect(container.querySelectorAll('.cal-day')).toHaveLength(3);
  });

  it('first column is today', () => {
    const { container } = render(<CalendarM days={makeDaySlots()} now={now} />);
    const firstCol = container.querySelectorAll('.cal-day')[0];
    expect(firstCol).toHaveClass('cal-day--today');
  });

  it('renders compact pills with title', () => {
    const event: CalendarEvent = {
      id: '1', title: 'Tax', start: '2026-03-14T00:00:00', end: '2026-03-14T23:59:59',
      allDay: true, location: null, isCritical: true,
    };
    const days = makeDaySlots([undefined, undefined, undefined, { events: [event] }]);
    render(<CalendarM days={days} now={now} />);
    expect(screen.getByText('Tax')).toBeInTheDocument();
  });
});

describe('CalendarS', () => {
  it('renders today strip container', () => {
    const { container } = render(<CalendarS days={makeDaySlots()} now={now} />);
    expect(container.querySelector('.cal-today-strip')).not.toBeNull();
  });

  it('renders only today events', () => {
    const todayEvent: CalendarEvent = {
      id: '1', title: 'Today Event', start: '2026-03-14T10:00:00', end: '2026-03-14T11:00:00',
      allDay: false, location: null,
    };
    const futureEvent: CalendarEvent = {
      id: '2', title: 'Tomorrow Event', start: '2026-03-15T10:00:00', end: '2026-03-15T11:00:00',
      allDay: false, location: null,
    };
    const days = makeDaySlots([
      undefined, undefined, undefined,
      { events: [todayEvent] },
      { events: [futureEvent] },
    ]);
    render(<CalendarS days={days} now={now} />);
    expect(screen.getByText('Today Event')).toBeInTheDocument();
    expect(screen.queryByText('Tomorrow Event')).not.toBeInTheDocument();
  });
});

describe('CalendarVertical', () => {
  it('renders vertical container with only today + future rows (no past)', () => {
    const { container } = render(<CalendarVertical days={makeDaySlots()} now={now} />);
    expect(container.querySelector('.cal-vertical')).not.toBeNull();
    // 11 slots - 3 past = 8 rows (today + 7 future)
    expect(container.querySelectorAll('.cal-vrow')).toHaveLength(8);
  });

  it('does not render past rows', () => {
    const { container } = render(<CalendarVertical days={makeDaySlots()} now={now} />);
    expect(container.querySelectorAll('.cal-vrow--past')).toHaveLength(0);
  });

  it('applies cal-vrow--today to today row', () => {
    const { container } = render(<CalendarVertical days={makeDaySlots()} now={now} />);
    expect(container.querySelector('.cal-vrow--today')).not.toBeNull();
  });

  it('renders spine divider in each row', () => {
    const { container } = render(<CalendarVertical days={makeDaySlots()} now={now} />);
    expect(container.querySelectorAll('.cal-vrow-spine')).toHaveLength(8);
  });

  it('renders future events as pills with cal-pill-vertical class', () => {
    const event: CalendarEvent = {
      id: '1', title: 'Future', start: '2026-03-15T10:00:00', end: '2026-03-15T11:00:00',
      allDay: false, location: null,
    };
    const days = makeDaySlots([undefined, undefined, undefined, undefined, { events: [event] }]);
    const { container } = render(<CalendarVertical days={days} now={now} />);
    expect(screen.getByText('Future')).toBeInTheDocument();
    expect(container.querySelector('.cal-pill-vertical')).not.toBeNull();
  });
});

describe('Calendar (main component)', () => {
  beforeEach(() => {
    mockData = null;
    mockConfig = {};
  });

  it('renders loading skeleton when data is null', () => {
    mockData = null;
    const { container } = render(<Calendar />);
    expect(container.querySelector('.dash-skeleton')).not.toBeNull();
  });

  it('renders error state when data has error', () => {
    mockData = { events: [], error: 'Not authorized' };
    render(<Calendar />);
    expect(screen.getByText('Not authorized')).toBeInTheDocument();
  });

  it('renders XL layout by default', () => {
    mockData = { events: [], lastUpdated: '2026-03-14T12:00:00' };
    mockConfig = {};
    const { container } = render(<Calendar />);
    expect(container.querySelector('.cal-tg')).not.toBeNull();
  });

  it('renders S layout when config.layout is "s"', () => {
    mockData = { events: [], lastUpdated: '2026-03-14T12:00:00' };
    mockConfig = { layout: 's' };
    const { container } = render(<Calendar />);
    expect(container.querySelector('.cal-today-strip')).not.toBeNull();
  });

  it('renders vertical layout when config.layout is "vertical"', () => {
    mockData = { events: [], lastUpdated: '2026-03-14T12:00:00' };
    mockConfig = { layout: 'vertical' };
    const { container } = render(<Calendar />);
    expect(container.querySelector('.cal-vertical')).not.toBeNull();
  });

  it('renders widget header with "Calendar" label', () => {
    mockData = { events: [], lastUpdated: '2026-03-14T12:00:00' };
    render(<Calendar />);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('renders widget header with "Today" label for S layout', () => {
    mockData = { events: [], lastUpdated: '2026-03-14T12:00:00' };
    mockConfig = { layout: 's' };
    render(<Calendar />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders footer with status dot', () => {
    mockData = { events: [], lastUpdated: '2026-03-14T12:00:00' };
    const { container } = render(<Calendar />);
    expect(container.querySelector('.dash-status-dot')).not.toBeNull();
  });
});

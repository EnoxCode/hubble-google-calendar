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
    { date: new Date('2026-03-11'), dayName: 'Wed', dayNum: 11, status: 'past', events: [] },
    { date: new Date('2026-03-12'), dayName: 'Thu', dayNum: 12, status: 'past', events: [] },
    { date: new Date('2026-03-13'), dayName: 'Fri', dayNum: 13, status: 'past', events: [] },
    { date: new Date('2026-03-14'), dayName: 'Sat', dayNum: 14, status: 'today', events: [] },
    { date: new Date('2026-03-15'), dayName: 'Sun', dayNum: 15, status: 'future', events: [] },
    { date: new Date('2026-03-16'), dayName: 'Mon', dayNum: 16, status: 'future', events: [] },
    { date: new Date('2026-03-17'), dayName: 'Tue', dayNum: 17, status: 'future', events: [] },
  ];
  if (overrides) {
    overrides.forEach((o, i) => { if (o) Object.assign(base[i], o); });
  }
  return base;
}

const now = new Date('2026-03-14T12:00:00');

describe('CalendarXL', () => {
  it('renders 7 day columns with day names and numbers', () => {
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    expect(container.querySelectorAll('.cal-day')).toHaveLength(7);
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('applies cal-day--today to today column', () => {
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    const todayCol = container.querySelectorAll('.cal-day')[3];
    expect(todayCol).toHaveClass('cal-day--today');
  });

  it('applies cal-day--past to past columns', () => {
    const { container } = render(<CalendarXL days={makeDaySlots()} now={now} />);
    const pastCol = container.querySelectorAll('.cal-day')[0];
    expect(pastCol).toHaveClass('cal-day--past');
  });

  it('renders event pills with title and time', () => {
    const event: CalendarEvent = {
      id: '1', title: 'Standup', start: '2026-03-14T09:00:00', end: '2026-03-14T09:15:00',
      allDay: false, location: null, color: '#4285F4',
    };
    const days = makeDaySlots([undefined, undefined, undefined, { events: [event] }]);
    render(<CalendarXL days={days} now={now} />);
    expect(screen.getByText('Standup')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });

  it('shows +N overflow when more than 3 events', () => {
    const events: CalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i), title: `Event ${i}`, start: '2026-03-14T10:00:00', end: '2026-03-14T11:00:00',
      allDay: false, location: null,
    }));
    const days = makeDaySlots([undefined, undefined, undefined, { events }]);
    render(<CalendarXL days={days} now={now} />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
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
    // 7 slots - 3 past = 4 rows (today + 3 future)
    expect(container.querySelectorAll('.cal-vrow')).toHaveLength(4);
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
    expect(container.querySelectorAll('.cal-vrow-spine')).toHaveLength(4);
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
    const grid = container.querySelector('.cal-grid');
    expect(grid).not.toBeNull();
    expect(grid).not.toHaveClass('cal-grid--compact');
    expect(grid).not.toHaveClass('cal-grid--3col');
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

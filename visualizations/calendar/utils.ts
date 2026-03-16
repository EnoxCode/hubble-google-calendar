export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
  color?: string;
  isCritical?: boolean;
}

export interface DaySlot {
  date: Date;
  dayName: string;
  dayNum: number;
  status: 'past' | 'today' | 'future';
  events: CalendarEvent[];
}

export type DashPillState = 'positive' | 'info' | 'warning' | 'critical' | 'neutral';
export type DashPillVariant = 'glass' | 'full';

export interface CalendarLayoutProps {
  days: DaySlot[];
  now: Date;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDaySlots(events: CalendarEvent[], today: Date): DaySlot[] {
  const todayStr = toDateKey(today);
  const slots: DaySlot[] = [];

  for (let offset = -3; offset <= 7; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const key = toDateKey(date);

    slots.push({
      date,
      dayName: DAY_NAMES[date.getDay()],
      dayNum: date.getDate(),
      status: key === todayStr ? 'today' : offset < 0 ? 'past' : 'future',
      events: events.filter(ev => {
        const evStart = ev.start.split('T')[0] || ev.start;
        const evEnd = ev.end.split('T')[0] || ev.end;
        // For multi-day/all-day events, check if this slot falls within the range
        // For timed events, match on start date
        if (ev.allDay) {
          return key >= evStart && key < evEnd;
        }
        return evStart === key;
      }),
    });
  }

  return slots;
}

export function getPillVariant(event: CalendarEvent, now: Date): DashPillVariant {
  if (event.isCritical) return 'full';
  if (event.allDay) return 'full';

  const start = new Date(event.start);
  const end = new Date(event.end);

  if (now >= start && now <= end) return 'full';
  if (end < now && toDateKey(end) === toDateKey(now)) return 'full';

  return 'glass';
}

export function getPillState(event: CalendarEvent): DashPillState {
  if (event.isCritical) return 'critical';
  if (event.allDay) return 'info';
  return 'neutral';
}

/** Returns the event's Google Calendar hex color, or undefined if none. */
export function getPillColor(event: CalendarEvent): string | undefined {
  return event.color ?? undefined;
}

export function getVisibleEvents(
  events: CalendarEvent[],
  maxVisible: number,
): { visible: CalendarEvent[]; overflowCount: number } {
  if (events.length <= maxVisible) {
    return { visible: events, overflowCount: 0 };
  }

  const critical = events.filter(e => e.isCritical);
  const nonCritical = events.filter(e => !e.isCritical);
  const slotsForNonCritical = maxVisible - critical.length;

  if (slotsForNonCritical <= 0) {
    return { visible: critical.slice(0, maxVisible), overflowCount: events.length - maxVisible };
  }

  const visible = [...critical, ...nonCritical.slice(0, slotsForNonCritical)];
  return { visible, overflowCount: events.length - visible.length };
}

export function formatTime(dateStr: string, allDay: boolean): string {
  if (allDay) return 'All day';
  const date = new Date(dateStr);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatMonthMeta(today: Date): string {
  return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatRangeMeta(days: DaySlot[]): string {
  const todayIdx = days.findIndex(d => d.status === 'today');
  const rangeDays = days.slice(todayIdx, todayIdx + 4);
  if (rangeDays.length < 2) return formatMonthMeta(rangeDays[0]?.date ?? new Date());
  const first = rangeDays[0];
  const last = rangeDays[rangeDays.length - 1];
  const month = first.date.toLocaleDateString('en-US', { month: 'short' });
  return `${month} ${first.dayNum}\u2013${last.dayNum}`;
}

const GOOGLE_COLOR_MAP: Record<string, DashPillState> = {
  '#DC2626': 'critical',  // Tomato
  '#E67C73': 'critical',  // Flamingo
  '#F4B400': 'warning',   // Banana
  '#F09300': 'warning',   // Tangerine
  '#33B679': 'positive',  // Sage
  '#0B8043': 'positive',  // Basil
  '#34A853': 'positive',  // Green
  '#039BE5': 'info',      // Peacock
  '#4285F4': 'info',      // Blueberry
  '#7986CB': 'info',      // Lavender
  '#8E24AA': 'info',      // Grape
  '#616161': 'neutral',   // Graphite
};

export function getGoogleColorState(hex: string): DashPillState {
  return GOOGLE_COLOR_MAP[hex.toUpperCase()] ?? GOOGLE_COLOR_MAP[hex] ?? 'neutral';
}

export function getStateColor(state: DashPillState): string {
  const map: Record<DashPillState, string> = {
    positive: 'var(--dash-state-positive)',
    info: 'var(--dash-state-info)',
    warning: 'var(--dash-state-warning)',
    critical: 'var(--dash-state-critical)',
    neutral: 'rgba(255, 255, 255, 0.2)',
  };
  return map[state];
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

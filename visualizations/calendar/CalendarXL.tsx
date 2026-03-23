import React from 'react';
import { DashPill } from 'hubble-dash-ui';
import type { CalendarLayoutProps, CalendarEvent } from './utils';
import {
  getEventPosition,
  getPillState,
  getPillColor,
  formatTime,
} from './utils';

const START_HOUR = 8;
const END_HOUR   = 22;
const PX_PER_HOUR = 40;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * PX_PER_HOUR; // 560px

const HOUR_LABELS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
  const h = START_HOUR + i;
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
});

function isInTimeRange(event: CalendarEvent, dayDate: Date): boolean {
  if (event.allDay) return false;
  const gridStart = new Date(dayDate);
  gridStart.setHours(START_HOUR, 0, 0, 0);
  return new Date(event.end) > gridStart;
}

export function CalendarXL({ days, now }: CalendarLayoutProps) {
  const todayIdx  = days.findIndex(d => d.status === 'today');
  const startIdx  = todayIdx >= 0 ? todayIdx : 3;
  const week      = days.slice(startIdx, startIdx + 7);

  const nowHour    = now.getHours();
  const nowMin     = now.getMinutes();
  const nowInRange = nowHour >= START_HOUR && nowHour < END_HOUR;
  const nowTop     = ((nowHour * 60 + nowMin - START_HOUR * 60) / 60) * PX_PER_HOUR;

  return (
    <div className="cal-tg">

      {/* ── Day header row ── */}
      <div className="cal-tg-day-headers">
        <div className="cal-tg-gutter" />
        {week.map(day => (
          <div
            key={day.dayNum}
            className={`cal-tg-header-cell${day.status === 'today' ? ' cal-tg-header-cell--today' : ''}`}
          >
            <div className="cal-tg-header-abbr">{day.dayName}</div>
            <div className="cal-tg-header-num">{day.dayNum}</div>
          </div>
        ))}
      </div>

      {/* ── All-day strip ── */}
      <div className="cal-tg-allday-row">
        <div className="cal-tg-allday-label">all<br />day</div>
        {week.map(day => (
          <div key={day.dayNum} className="cal-tg-allday-cell">
            {day.events
              .filter(ev => ev.allDay)
              .map(ev => (
                <DashPill
                  key={ev.id}
                  title={ev.title}
                  variant="full"
                  state={getPillState(ev)}
                  color={getPillColor(ev)}
                />
              ))}
          </div>
        ))}
      </div>

      {/* ── Scrollable time body ── */}
      <div className="cal-tg-body">

        {/* Time label column */}
        <div className="cal-tg-labels">
          {HOUR_LABELS.map(label => (
            <div key={label} className="cal-tg-slot">
              <span className="cal-tg-slot-text">{label}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {week.map(day => {
          const timedEvents = day.events.filter(ev => isInTimeRange(ev, day.date));

          return (
            <div
              key={day.dayNum}
              className={`cal-tg-col${day.status === 'today' ? ' cal-tg-col--today' : ''}`}
              style={{ height: TOTAL_HEIGHT }}
            >
              {/* Hour grid lines */}
              {HOUR_LABELS.map((_, i) => (
                <div
                  key={i}
                  className="cal-tg-hour-line"
                  style={{ top: i * PX_PER_HOUR }}
                />
              ))}

              {/* Now indicator (today only) */}
              {day.status === 'today' && nowInRange && (
                <div className="cal-tg-now-line" style={{ top: nowTop }} />
              )}

              {/* Timed events */}
              {timedEvents.map(ev => {
                const pos = getEventPosition(ev, START_HOUR, END_HOUR, PX_PER_HOUR);
                return (
                  <div
                    key={ev.id}
                    className="cal-tg-event"
                    style={{
                      top: pos.top,
                      height: pos.height,
                      ...(getPillColor(ev) && {
                        background:  getPillColor(ev) + '33',
                        borderColor: getPillColor(ev) + '66',
                      }),
                    }}
                  >
                    <div className="cal-tg-event-title">{ev.title}</div>
                    <div className="cal-tg-event-time">{formatTime(ev.start, false)}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

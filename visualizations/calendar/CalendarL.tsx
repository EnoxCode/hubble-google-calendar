import React from 'react';
import { DashPill } from 'hubble-dash-ui';
import type { CalendarLayoutProps } from './utils';
import type { DaySlot } from './utils';
import { getPillVariant, getPillState, getPillColor, getVisibleEvents } from './utils';

export function CalendarL({ days, now }: CalendarLayoutProps) {
  const week = days.slice(0, 7);
  return (
    <div className="cal-grid cal-grid--compact">
      {week.map(day => {
        const statusClass = day.status === 'today' ? 'cal-day--today'
          : day.status === 'past' ? 'cal-day--past' : '';
        return (
          <div key={day.dayNum} className={`cal-day ${statusClass}`}>
            <div className="cal-day-header">
              <div className="cal-day-name">{day.dayName}</div>
              <div className="cal-day-num">{day.dayNum}</div>
            </div>
            <div className="cal-events">
              {day.status === 'today'
                ? renderTodayCompact(day, now)
                : renderDotEvents(day)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderTodayCompact(day: DaySlot, now: Date) {
  const { visible, overflowCount } = getVisibleEvents(day.events, 1);
  return (
    <>
      {visible.map(event => (
        <DashPill
          key={event.id}
          title={event.title}
          variant={getPillVariant(event, now)}
          state={getPillState(event)}
          color={getPillColor(event)}
          className="cal-pill-compact"
        />
      ))}
      {overflowCount > 0 && <span className="cal-pill-overflow">+{overflowCount}</span>}
    </>
  );
}

function renderDotEvents(day: DaySlot) {
  if (day.events.length === 0) return null;
  return (
    <>
      {day.events.map(event => (
        <DashPill.Dot key={event.id} color={event.color ?? 'rgba(255, 255, 255, 0.4)'} label={event.title} />
      ))}
    </>
  );
}

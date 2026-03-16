import React from 'react';
import { DashPill } from 'hubble-dash-ui';
import type { CalendarLayoutProps } from './utils';
import { getPillVariant, getPillState, getPillColor, getVisibleEvents, formatTime } from './utils';

export function CalendarXL({ days, now }: CalendarLayoutProps) {
  const week = days.slice(0, 7);
  return (
    <div className="cal-grid">
      {week.map(day => {
        const statusClass = day.status === 'today' ? 'cal-day--today'
          : day.status === 'past' ? 'cal-day--past' : '';

        const { visible, overflowCount } = getVisibleEvents(day.events, 3);

        return (
          <div key={day.dayNum} className={`cal-day ${statusClass}`}>
            <div className="cal-day-header">
              <div className="cal-day-name">{day.dayName}</div>
              <div className="cal-day-num">{day.dayNum}</div>
            </div>
            <div className="cal-events">
              {visible.map(event => (
                <DashPill
                  key={event.id}
                  title={event.title}
                  time={formatTime(event.start, event.allDay)}
                  location={event.location ?? undefined}
                  variant={getPillVariant(event, now)}
                  state={getPillState(event)}
                  color={getPillColor(event)}
                />
              ))}
              {overflowCount > 0 && (
                <span className="cal-pill-overflow">+{overflowCount} more</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { DashPill } from 'hubble-dash-ui';
import type { CalendarLayoutProps } from './utils';
import { getPillVariant, getPillState, getPillColor, getVisibleEvents } from './utils';

export function CalendarM({ days, now }: CalendarLayoutProps) {
  const todayIdx = days.findIndex(d => d.status === 'today');
  const threeDays = days.slice(todayIdx, todayIdx + 3);

  return (
    <div className="cal-grid cal-grid--3col">
      {threeDays.map(day => {
        const statusClass = day.status === 'today' ? 'cal-day--today' : '';
        const { visible, overflowCount } = getVisibleEvents(day.events, 4);
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
                  variant={getPillVariant(event, now)}
                  state={getPillState(event)}
                  color={getPillColor(event)}
                  className="cal-pill-compact"
                />
              ))}
              {overflowCount > 0 && <span className="cal-pill-overflow">+{overflowCount}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

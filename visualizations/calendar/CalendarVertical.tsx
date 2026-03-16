import React from 'react';
import { DashPill } from 'hubble-dash-ui';
import type { CalendarLayoutProps, DaySlot } from './utils';
import { getPillVariant, getPillState, getPillColor, getVisibleEvents } from './utils';

export function CalendarVertical({ days, now }: CalendarLayoutProps) {
  const todayIdx = days.findIndex(d => d.status === 'today');
  const futureDays = days.slice(todayIdx >= 0 ? todayIdx : 0);

  return (
    <div className="cal-vertical">
      {futureDays.map(day => {
        const isToday = day.status === 'today';
        const statusClass = isToday ? 'cal-vrow--today' : '';

        return (
          <div key={day.dayNum} className={`cal-vrow ${statusClass}`}>
            <div className="cal-vrow-date">
              <div className="cal-vrow-name">{day.dayName}</div>
              <div className="cal-vrow-num">{day.dayNum}</div>
            </div>
            <div className="cal-vrow-spine" />
            <div className="cal-vrow-events">
              {renderCompactPills(day, now, isToday)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderCompactPills(day: DaySlot, now: Date, showLocation: boolean) {
  const { visible, overflowCount } = getVisibleEvents(day.events, 4);
  return (
    <>
      {visible.map(event => (
        <DashPill
          key={event.id}
          title={event.title}
          location={showLocation ? (event.location ?? undefined) : undefined}
          variant={getPillVariant(event, now)}
          state={getPillState(event)}
          color={getPillColor(event)}
          className="cal-pill-vertical"
        />
      ))}
      {overflowCount > 0 && <span className="cal-pill-overflow">+{overflowCount}</span>}
    </>
  );
}

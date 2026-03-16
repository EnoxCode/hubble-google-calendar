import React from 'react';
import { DashPill } from 'hubble-dash-ui';
import type { CalendarLayoutProps } from './utils';
import { getPillVariant, getPillState, getPillColor, formatTime } from './utils';

export function CalendarS({ days, now }: CalendarLayoutProps) {
  const today = days.find(d => d.status === 'today');
  if (!today) return null;

  return (
    <div className="cal-today-strip">
      {today.events.map(event => (
        <DashPill
          key={event.id}
          title={event.title}
          time={formatTime(event.start, event.allDay)}
          variant={getPillVariant(event, now)}
          state={getPillState(event)}
          color={getPillColor(event)}
        />
      ))}
    </div>
  );
}

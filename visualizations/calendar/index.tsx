import React from 'react';
import { useConnectorData, useWidgetConfig } from 'hubble-sdk';
import { DashWidget, DashWidgetHeader, DashWidgetFooter, DashSkeleton } from 'hubble-dash-ui';
import './style.css';
import { getDaySlots, formatMonthMeta, formatRangeMeta } from './utils';
import type { CalendarEvent, CalendarLayoutProps } from './utils';
import { CalendarXL } from './CalendarXL';
import { CalendarL } from './CalendarL';
import { CalendarM } from './CalendarM';
import { CalendarS } from './CalendarS';
import { CalendarVertical } from './CalendarVertical';

interface CalendarData {
  events: CalendarEvent[];
  lastUpdated?: string;
  error?: string;
}

const LAYOUTS: Record<string, React.ComponentType<CalendarLayoutProps>> = {
  s: CalendarS,
  m: CalendarM,
  l: CalendarL,
  xl: CalendarXL,
  vertical: CalendarVertical,
};

export default function Calendar() {
  const data = useConnectorData<CalendarData>();
  const config = useWidgetConfig<{ layout?: string; title?: string }>();
  const layout = config?.layout ?? 'xl';
  const now = new Date();

  if (!data) {
    return (
      <DashWidget>
        <DashWidgetHeader label="Calendar" />
        <DashSkeleton height={32} width="60%" />
        <DashSkeleton height={10} width="80%" />
      </DashWidget>
    );
  }

  if (data.error) {
    return (
      <DashWidget>
        <DashWidgetHeader label="Calendar" />
        <div className="dash-widget-content dash-widget-content--error">
          <span className="dash-error-icon">⚡</span>
          <span className="t-meta">{data.error}</span>
        </div>
      </DashWidget>
    );
  }

  const days = getDaySlots(data.events, now);
  const headerLabel = layout === 's' ? 'Today' : 'Calendar';
  const meta = layout === 's'
    ? now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : layout === 'm'
      ? formatRangeMeta(days)
      : formatMonthMeta(now);

  const LayoutComponent = LAYOUTS[layout] ?? CalendarXL;
  const updatedAt = data.lastUpdated ? new Date(data.lastUpdated) : undefined;

  return (
    <DashWidget>
      <DashWidgetHeader label={headerLabel} meta={meta} />
      <LayoutComponent days={days} now={now} />
      <DashWidgetFooter updatedAt={updatedAt} status="ok" />
    </DashWidget>
  );
}

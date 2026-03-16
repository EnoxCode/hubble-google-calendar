import { vi } from 'vitest';
import React from 'react';

const mock = (name: string, render?: (p: Record<string, unknown>) => React.ReactElement | null) => {
  const c = vi.fn((props: Record<string, unknown>) =>
    render ? render(props) : React.createElement('div', { 'data-testid': name }, props.children as React.ReactNode));
  Object.defineProperty(c, 'name', { value: name });
  return c;
};

export const DashWidget = mock('DashWidget', (p) => React.createElement('div', { 'data-testid': 'DashWidget', className: p.className }, p.children));
export const DashWidgetHeader = mock('DashWidgetHeader', (p) => React.createElement('div', { 'data-testid': 'DashWidgetHeader' }, p.label && React.createElement('span', null, p.label), p.children));
export const DashWidgetFooter = mock('DashWidgetFooter', (p) => React.createElement('div', { 'data-testid': 'DashWidgetFooter' },
  p.timestamp && React.createElement('span', null, String(p.timestamp)),
  p.updatedAt && React.createElement('span', null, String(p.updatedAt)),
  p.status && React.createElement('span', { className: 'dash-status-dot', 'data-status': p.status }),
  p.children));
export const DashStatusDot = mock('DashStatusDot', (p) => React.createElement('span', { 'data-testid': 'DashStatusDot', className: 'dash-status-dot', 'data-status': p.status }));
export const DashSkeleton = mock('DashSkeleton', () => React.createElement('div', { 'data-testid': 'DashSkeleton', className: 'dash-skeleton' }));
export const DashDivider = mock('DashDivider', () => React.createElement('hr', { 'data-testid': 'DashDivider' }));
export const DashBadge = mock('DashBadge', (p) => React.createElement('span', { 'data-testid': 'DashBadge', 'data-variant': p.variant }, p.children));
export const DashPill = Object.assign(
  mock('DashPill', (p) => {
    const variant = p.variant as string | undefined;
    const cls = ['dash-pill', variant && `dash-pill--${variant}`, p.className].filter(Boolean).join(' ');
    return React.createElement('div', { 'data-testid': 'DashPill', 'data-variant': variant, className: cls },
      (p.label || p.title) && React.createElement('span', null, String(p.label || p.title)),
      p.time && React.createElement('span', null, String(p.time)),
      p.children);
  }),
  { Dot: mock('DashPill.Dot', (p) => React.createElement('span', { 'data-testid': 'DashPillDot', className: 'dash-pill-dot', 'data-color': p.color }, p.label && React.createElement('span', null, String(p.label)))) },
);
export const DashCarouselDots = mock('DashCarouselDots', () => React.createElement('div', { 'data-testid': 'DashCarouselDots' }));
export const DashThumbnail = mock('DashThumbnail', (p) => React.createElement('div', { 'data-testid': 'DashThumbnail' }, p.children));

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  MetricWidget, AnalyticsCard, DashboardWidget, FilterBar, SearchBar, CommandBar,
  NotificationBell, ActivityFeed, AuditTimeline, StatusIndicator, LiveStatusBadge,
  KPIGrid, ResizablePanel, SplitView, DockPanel,
} from '../index.js';
import { Bell, DollarSign } from 'lucide-react';

describe('Enterprise components (2H)', () => {
  it('MetricWidget shows value + delta direction', () => {
    render(<MetricWidget icon={DollarSign} label="Revenue" value="$9k" delta={12} />);
    expect(screen.getByText('$9k')).toBeInTheDocument();
    expect(screen.getByText(/▲ 12%/)).toBeInTheDocument();
  });
  it('AnalyticsCard shows title + chart + stats', () => {
    render(<AnalyticsCard title="Sales" chart={<div className="chart" />} stats={[{ label: 'Orders', value: '120' }]} />);
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });
  it('DashboardWidget shows title + body', () => {
    render(<DashboardWidget title="Panel"><div>content</div></DashboardWidget>);
    expect(screen.getByText('Panel')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
  it('FilterBar renders selects + search and reports changes', () => {
    const onSearch = vi.fn(), onF = vi.fn();
    render(<FilterBar onSearch={onSearch} filters={[{ key: 'status', label: 'Status', options: [{ value: 'a', label: 'A' }], onChange: onF }]} />);
    const sel = screen.getByLabelText('Status');
    fireEvent.change(sel, { target: { value: 'a' } });
    expect(onF).toHaveBeenCalledWith('a');
    fireEvent.change(screen.getByLabelText('Filter search'), { target: { value: 'x' } });
    expect(onSearch).toHaveBeenCalledWith('x');
  });
  it('SearchBar submits query', () => {
    const onSearch = vi.fn();
    render(<SearchBar value="" onSearch={onSearch} />);
    fireEvent.submit(screen.getByRole('form'));
    expect(onSearch).toHaveBeenCalled();
  });
  it('CommandBar toggles single + multi', () => {
    const onSel = vi.fn();
    const { rerender } = render(<CommandBar items={[{ key: '1', label: 'One' }, { key: '2', label: 'Two' }]} value="1" onSelect={onSel} />);
    fireEvent.click(screen.getByTitle('Two'));
    expect(onSel).toHaveBeenCalledWith('2');
    rerender(<CommandBar mode="multi" items={[{ key: '1', label: 'One' }]} value={[]} onSelect={onSel} />);
    expect(screen.getByTitle('One')).toBeInTheDocument();
  });
  it('NotificationBell shows unread count and opens menu', () => {
    render(<NotificationBell items={[{ id: 1, title: 'Hi', unread: true }, { id: 2, title: 'Bye' }]} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Notifications/));
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });
  it('ActivityFeed lists items', () => {
    render(<ActivityFeed items={[{ id: 1, user: 'Ana', action: 'created', target: 'order', time: '2m' }]} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/created/)).toBeInTheDocument();
  });
  it('AuditTimeline lists actor + action', () => {
    render(<AuditTimeline events={[{ id: 1, actor: 'Bob', action: 'deleted', target: 'user', time: '1h' }]} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/deleted/)).toBeInTheDocument();
  });
  it('StatusIndicator renders dot with tone', () => {
    const { container } = render(<StatusIndicator tone="success" label="OK" pulse />);
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(container.querySelector('.ds-status__dot--pulse')).toBeTruthy();
  });
  it('LiveStatusBadge renders online/offline', () => {
    const { rerender } = render(<LiveStatusBadge status="online" />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    rerender(<LiveStatusBadge status="offline" />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
  it('KPIGrid renders children in a grid', () => {
    const { container } = render(<KPIGrid><div className="k">a</div><div className="k">b</div></KPIGrid>);
    expect(container.querySelector('.ds-kpi-grid')).toBeTruthy();
    expect(container.querySelectorAll('.k').length).toBe(2);
  });
  it('ResizablePanel collapses', () => {
    render(<ResizablePanel title="P" collapsible><div>body</div></ResizablePanel>);
    expect(screen.getByText('P')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Collapse'));
    expect(screen.queryByText('body')).toBeNull();
  });
  it('SplitView renders two panes', () => {
    const { container } = render(<SplitView start={<div className="a">A</div>} end={<div className="b">B</div>} />);
    expect(container.querySelector('.ds-split__pane')).toBeTruthy();
    expect(container.querySelector('.ds-split__gutter')).toBeTruthy();
  });
  it('DockPanel toggles a panel', () => {
    const { container } = render(<DockPanel panels={[{ key: 'logs', label: 'Logs', content: <div>log text</div> }]}><div>main</div></DockPanel>);
    expect(screen.getByText('main')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Logs'));
    expect(screen.getByText('log text')).toBeInTheDocument();
    expect(container.querySelector('.ds-dock__btn--active')).toBeTruthy();
  });
});

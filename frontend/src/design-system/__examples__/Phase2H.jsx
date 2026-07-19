import React from 'react';
import {
  MetricWidget, AnalyticsCard, DashboardWidget, FilterBar, SearchBar, CommandBar,
  NotificationBell, ActivityFeed, AuditTimeline, StatusIndicator, LiveStatusBadge,
  KPIGrid, ResizablePanel, SplitView, DockPanel,
} from '../index.js';
import { DollarSign, Users, TrendingUp, Bell } from 'lucide-react';

export const EnterpriseExamples = () => (
  <div style={{ display: 'grid', gap: 24 }}>
    <KPIGrid>
      <MetricWidget icon={DollarSign} label="Revenue" value="$9k" delta={12} />
      <MetricWidget icon={Users} label="Riders" value="1.2k" delta={-4} />
      <MetricWidget icon={TrendingUp} label="Trips" value="340" delta={8} />
    </KPIGrid>

    <AnalyticsCard title="Weekly orders" subtitle="vs last week" chart={<div style={{ height: 120, background: 'var(--ds-color-surface-2)', borderRadius: 8 }} />} stats={[{ label: 'Orders', value: '1,204' }, { label: 'Growth', value: '+8%' }]} />

    <DashboardWidget title="Operations">
      <FilterBar onSearch={() => {}} filters={[{ key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }] }]} />
      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatusIndicator tone="success" label="Online" pulse />
        <LiveStatusBadge status="online" />
        <LiveStatusBadge status="busy" />
        <CommandBar items={[{ key: 'day', label: 'Day' }, { key: 'week', label: 'Week' }]} value="day" onSelect={() => {}} />
      </div>
    </DashboardWidget>

    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <NotificationBell items={[{ id: 1, title: 'New order', unread: true }, { id: 2, title: 'Driver arrived' }]} />
      <SearchBar onSearch={() => {}} />
    </div>

    <ActivityFeed items={[{ id: 1, user: 'Ana', action: 'completed trip', time: '2m' }]} />
    <AuditTimeline events={[{ id: 1, actor: 'Admin', action: 'suspended', target: 'driver #12', time: '1h' }]} />

    <SplitView start={<div style={{ padding: 12 }}>Left pane</div>} end={<div style={{ padding: 12 }}>Right pane</div>} />
    <DockPanel panels={[{ key: 'logs', label: 'Logs', content: <div style={{ padding: 12 }}>System log output…</div> }]}><div style={{ padding: 12, height: 120 }}>Main content</div></DockPanel>
    <ResizablePanel title="Details" collapsible><div style={{ padding: 12 }}>Resizable body</div></ResizablePanel>
  </div>
);

export default EnterpriseExamples;

import React from 'react';
import {
  LineChart, BarChart, AreaChart, PieChart, DonutChart, Gauge, Heatmap,
  Sparkline, ChartLegend, ChartTooltip, KPICard, EmptyChart, LoadingChart, ChartContainer,
} from '../index.js';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

const data = [
  { label: 'Mon', orders: 12, revenue: 300 },
  { label: 'Tue', orders: 18, revenue: 420 },
  { label: 'Wed', orders: 9, revenue: 210 },
  { label: 'Thu', orders: 22, revenue: 510 },
];
const pie = [{ name: 'Paid', value: 70 }, { name: 'Unpaid', value: 30 }];

export const ChartExamples = () => (
  <div style={{ display: 'grid', gap: 24 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
      <KPICard icon={DollarSign} label="Revenue" value="$9k" delta={12} trend={[1, 2, 3, 4, 5]} />
      <KPICard icon={Users} label="Riders" value="1.2k" delta={-4} trend={[5, 4, 3, 2, 1]} />
      <KPICard icon={TrendingUp} label="Trips" value="340" delta={8} trend={[2, 3, 3, 4, 5]} />
    </div>
    <LineChart data={data} series={[{ key: 'orders' }]} xKey="label" title="Orders / day" />
    <BarChart data={data} series={[{ key: 'revenue' }]} xKey="label" title="Revenue / day" />
    <AreaChart data={data} series={[{ key: 'orders' }, { key: 'revenue' }]} xKey="label" title="Orders vs Revenue" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <PieChart data={pie} title="Payment status" />
      <DonutChart data={pie} title="Payment mix" />
    </div>
    <Gauge value={72} max={100} tone="success" label="72%" />
    <Heatmap data={[[0.1, 0.9, 0.4], [0.5, 0.3, 0.8]]} xLabels={['A', 'B', 'C']} yLabels={['W1', 'W2']} />
    <Sparkline data={[1, 3, 2, 5, 4, 6]} width={240} height={40} />
    <EmptyChart title="No analytics yet" description="Connect a data source." />
    <ChartContainer title="Loading example"><LoadingChart label="Fetching metrics…" /></ChartContainer>
  </div>
);

export default ChartExamples;

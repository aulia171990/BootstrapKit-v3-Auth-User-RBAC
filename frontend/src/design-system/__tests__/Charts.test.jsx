import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LineChart, BarChart, AreaChart, PieChart, DonutChart } from '../index.js';
import Gauge from '../components/Gauge/index.js';
import Sparkline from '../components/Sparkline/index.js';
import Heatmap from '../components/Heatmap/index.js';
import ChartTooltip from '../components/ChartTooltip/index.js';
import ChartLegend from '../components/ChartLegend/index.js';
import KPICard from '../components/KPICard/index.js';
import EmptyChart from '../components/EmptyChart/index.js';
import LoadingChart from '../components/LoadingChart/index.js';
import ChartContainer from '../components/ChartContainer/index.js';

const data = [
  { label: 'Mon', orders: 12, revenue: 300 },
  { label: 'Tue', orders: 18, revenue: 420 },
  { label: 'Wed', orders: 9, revenue: 210 },
];
const pie = [{ name: 'Paid', value: 70 }, { name: 'Unpaid', value: 30 }];

describe('Chart wrappers (2F) — recharts-based', () => {
  it('LineChart renders container + svg', () => {
    const { container } = render(<LineChart data={data} series={[{ key: 'orders' }]} xKey="label" title="Orders" />);
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(container.querySelector('.ds-chart')).toBeTruthy();
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('BarChart renders svg', () => {
    const { container } = render(<BarChart data={data} series={[{ key: 'revenue' }]} xKey="label" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('AreaChart renders svg', () => {
    const { container } = render(<AreaChart data={data} series={[{ key: 'orders' }]} xKey="label" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('PieChart renders svg with slices', () => {
    const { container } = render(<PieChart data={pie} title="Payment" />);
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('DonutChart renders svg', () => {
    const { container } = render(<DonutChart data={pie} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
  it('charts show empty state when no data', () => {
    render(<LineChart data={[]} series={[{ key: 'orders' }]} empty="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});

describe('Chart helpers (2F) — SVG / lib-agnostic', () => {
  it('Gauge renders an svg arc with percentage', () => {
    const { container } = render(<Gauge value={75} max={100} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
  it('Sparkline renders a polyline path', () => {
    const { container } = render(<Sparkline data={[1, 3, 2, 5, 4]} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('path[stroke]')).toBeTruthy();
  });
  it('Heatmap renders a grid of cells', () => {
    const { container } = render(<Heatmap data={[[0.1, 0.9], [0.5, 0.3]]} />);
    expect(container.querySelectorAll('.ds-heatmap__cell').length).toBe(4);
  });
  it('ChartTooltip renders formatted rows', () => {
    render(<ChartTooltip active payload={[{ name: 'Orders', value: 12, color: '#000' }]} label="Mon" />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Orders: 12')).toBeInTheDocument();
  });
  it('ChartLegend renders items from payload', () => {
    render(<ChartLegend payload={[{ value: 'A', color: '#f00' }, { value: 'B', color: '#0f0' }]} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getAllByText(/B/).length).toBeGreaterThan(0);
  });
  it('KPICard renders metric value + sparkline', () => {
    const { container } = render(<KPICard icon={() => null} label="Revenue" value="$9k" trend={[1, 2, 3, 4]} />);
    expect(screen.getByText('$9k')).toBeInTheDocument();
    expect(container.querySelector('.ds-sparkline')).toBeTruthy();
  });
  it('EmptyChart renders title', () => {
    render(<EmptyChart title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
  it('LoadingChart renders status', () => {
    render(<LoadingChart label="Loading…" />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
  it('ChartContainer renders title + children', () => {
    render(<ChartContainer title="My chart"><div>body</div></ChartContainer>);
    expect(screen.getByText('My chart')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});

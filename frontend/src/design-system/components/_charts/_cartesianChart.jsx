import React from 'react';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, BarChart, Bar, AreaChart, Area, Cell,
} from '../_charts/_chartLib.js';
import ChartTooltip from '../ChartTooltip/index.js';
import ChartLegend from '../ChartLegend/index.js';
import EmptyChart from '../EmptyChart/index.js';
import { cx } from '../_util.js';
import './_charts.css';

const TYPE_MAP = { line: { C: LineChart, S: Line }, bar: { C: BarChart, S: Bar }, area: { C: AreaChart, S: Area } };

/**
 * Internal cartesian chart (line/bar/area). Not exported publicly.
 * @param {'line'|'bar'|'area'} type
 * @param {Array} data rows
 * @param {Array} series [{ key, name?, color?, type? (for mixed) }]
 * @param {string} xKey field for x axis
 */
export default function CartesianChart({ type, data = [], series = [], xKey = 'label', height = 280, showGrid = true, showLegend = true, showTooltip = true, colors, empty, loading, className, ...rest }) {
  if (loading) return <div className="ds-chart-loading" role="status" aria-live="polite"><span>{loading === true ? 'Loading chart…' : loading}</span></div>;
  if (!data.length) return <EmptyChart title={empty || 'No data'} />;
  const { C, S } = TYPE_MAP[type];
  return (
    <div className={cx('ds-chart__canvas')} style={{ height }} {...rest}>
      <ResponsiveContainer width="100%" height="100%">
        <C data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid stroke="var(--ds-color-border)" strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--ds-color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--ds-color-border)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--ds-color-text-muted)' }} tickLine={false} axisLine={false} width={36} />
          {showTooltip && <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--ds-color-surface-2)', opacity: 0.5 }} />}
          {showLegend && <Legend content={<ChartLegend />} />}
          {series.map((s, i) => (
            <S key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color || colors?.[i]} fill={s.color || colors?.[i]} fillOpacity={type === 'area' ? 0.18 : 1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          ))}
        </C>
      </ResponsiveContainer>
    </div>
  );
}

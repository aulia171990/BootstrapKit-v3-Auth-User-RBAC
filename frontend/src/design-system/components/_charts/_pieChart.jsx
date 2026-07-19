import React from 'react';
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip, Legend } from '../_charts/_chartLib.js';
import ChartContainer from '../ChartContainer/index.js';
import ChartTooltip from '../ChartTooltip/index.js';
import ChartLegend from '../ChartLegend/index.js';
import { cx } from '../_util.js';
import './_charts.css';

/**
 * PieChart / DonutChart — wraps recharts Pie.
 * @param {Array} data [{ name, value, color? }]
 * @param {boolean} donut inner radius > 0
 */
function PieChartBase({ donut = false, data = [], height = 280, colors, showLegend = true, showTooltip = true, title, subtitle, actions, empty, loading, className, ...rest }) {
  if (loading) return <ChartContainer title={title} subtitle={subtitle} actions={actions}><div className="ds-chart-loading" /></ChartContainer>;
  if (!data.length) return <ChartContainer title={title} subtitle={subtitle} actions={actions}><div className="ds-chart-empty">{empty || 'No data'}</div></ChartContainer>;
  return (
    <ChartContainer title={title} subtitle={subtitle} actions={actions}>
      <div className={cx('ds-chart__canvas')} style={{ height }} {...rest}>
        <ResponsiveContainer width="100%" height="100%">
          <RPieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={donut ? '55%' : 0} outerRadius="80%" paddingAngle={1} stroke="var(--ds-color-surface)">
              {data.map((d, i) => <Cell key={i} fill={d.color || colors?.[i]} />)}
            </Pie>
            {showLegend && <Legend content={<ChartLegend />} />}
          </RPieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export function PieChart(props) { return <PieChartBase donut={false} {...props} />; }
export function DonutChart(props) { return <PieChartBase donut={true} {...props} />; }

import React from 'react';
import CartesianChart from '../_charts/_cartesianChart.jsx';
import ChartContainer from '../ChartContainer/index.js';

/** AreaChart — wraps recharts AreaChart. */
export default function AreaChart(props) {
  const { title, subtitle, actions, ...rest } = props;
  return (
    <ChartContainer title={title} subtitle={subtitle} actions={actions}>
      <CartesianChart type="area" {...rest} />
    </ChartContainer>
  );
}

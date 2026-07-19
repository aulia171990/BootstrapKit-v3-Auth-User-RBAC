import React from 'react';
import CartesianChart from '../_charts/_cartesianChart.jsx';
import ChartContainer from '../ChartContainer/index.js';

/** BarChart — wraps recharts BarChart. */
export default function BarChart(props) {
  const { title, subtitle, actions, ...rest } = props;
  return (
    <ChartContainer title={title} subtitle={subtitle} actions={actions}>
      <CartesianChart type="bar" {...rest} />
    </ChartContainer>
  );
}

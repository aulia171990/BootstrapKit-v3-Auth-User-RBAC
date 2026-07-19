import React from 'react';
import CartesianChart from '../_charts/_cartesianChart.jsx';
import ChartContainer from '../ChartContainer/index.js';

/** LineChart — wraps recharts LineChart. See ChartContainer + CartesianChart props. */
export default function LineChart(props) {
  const { title, subtitle, actions, ...rest } = props;
  return (
    <ChartContainer title={title} subtitle={subtitle} actions={actions}>
      <CartesianChart type="line" {...rest} />
    </ChartContainer>
  );
}

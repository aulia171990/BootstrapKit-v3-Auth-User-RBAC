import React from 'react';
import { DonutChart as Inner } from '../_charts/_pieChart.jsx';

export default function DonutChart(props) { return <Inner donut={true} {...props} />; }

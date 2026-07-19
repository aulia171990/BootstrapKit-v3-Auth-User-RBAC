import React from 'react';
import { PieChart as Inner } from '../_charts/_pieChart.jsx';

export default function PieChart(props) { return <Inner donut={false} {...props} />; }

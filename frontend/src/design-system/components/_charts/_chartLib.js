/**
 * INTERNAL — the ONLY module that imports the chart library (recharts).
 * All public chart wrappers import from here so the underlying library is
 * never exposed to consumers. Swap the library here only.
 */
import {
  LineChart as RLineChart, BarChart as RBarChart, AreaChart as RAreaChart,
  PieChart as RPieChart, RadialBarChart as RRadialBarChart,
  Line as RLine, Bar as RBar, Area as RArea, Pie as RPie, Cell as RCell,
  XAxis as RXAxis, YAxis as RYAxis, CartesianGrid as RCartesianGrid,
  Tooltip as RTooltip, Legend as RLegend, ResponsiveContainer as RResponsiveContainer,
} from 'recharts';

export const LineChart = RLineChart;
export const BarChart = RBarChart;
export const AreaChart = RAreaChart;
export const PieChart = RPieChart;
export const RadialBarChart = RRadialBarChart;
export const Line = RLine;
export const Bar = RBar;
export const Area = RArea;
export const Pie = RPie;
export const Cell = RCell;
export const XAxis = RXAxis;
export const YAxis = RYAxis;
export const CartesianGrid = RCartesianGrid;
export const Tooltip = RTooltip;
export const Legend = RLegend;
export const ResponsiveContainer = RResponsiveContainer;

/** Curated, theme-aligned categorical palette (overridable per chart). */
export const CHART_PALETTE = [
  'var(--ds-color-primary)', 'var(--ds-color-success)', 'var(--ds-color-warning)',
  'var(--ds-color-danger)', 'var(--ds-color-info)', 'var(--ds-color-secondary)',
  'var(--ds-color-primary-hover)', 'var(--ds-color-success-hover)',
];

export const CHART_LIB_NAME = 'recharts';

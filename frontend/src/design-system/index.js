/* ============================================================
   Design System — JavaScript Token Accessor
   ------------------------------------------------------------
   Programmatic access to the design tokens (theme switching,
   JS media logic, chart theming, etc.). Tokens are read from
   computed CSS custom properties so a single source of truth
   (the CSS files) drives both styling and JS.

   Usage:
     import { theme, tokens, breakpoints } from '../design-system';
     theme.set('dark');
     theme.get();           // 'light' | 'dark' | 'system'
     tokens.get('color-primary'); // resolves '--ds-color-primary'
   ============================================================ */

const ROOT = document.documentElement;

/** Resolve a --ds-* token name to its current computed value. */
function resolveToken(name) {
  const prop = name.startsWith('--ds-') ? name : `--ds-${name}`;
  return getComputedStyle(ROOT).getPropertyValue(prop).trim();
}

export const theme = {
  /** Apply a theme mode. @param {'light'|'dark'|'system'} mode */
  set(mode) {
    if (!['light', 'dark', 'system'].includes(mode)) {
      throw new Error(`Invalid theme mode: ${mode}. Use 'light' | 'dark' | 'system'.`);
    }
    ROOT.setAttribute('data-theme', mode);
    try { localStorage.setItem('ds-theme', mode); } catch { /* SSR / privacy */ }
  },
  /** Read the currently applied theme mode. */
  get() {
    return ROOT.getAttribute('data-theme') || 'light';
  },
  /** Initialize theme from storage; defaults to 'system'. */
  init() {
    let saved;
    try { saved = localStorage.getItem('ds-theme'); } catch { /* ignore */ }
    this.set(saved || 'system');
    return this.get();
  },
};

export const tokens = {
  /** Get a single token value (examples: 'color-primary', 'space-4'). */
  get(name) { return resolveToken(name); },
  /** Get many tokens at once: object of name -> value. */
  getAll(names) {
    const out = {};
    for (const n of names) out[n] = resolveToken(n);
    return out;
  },
};

export const breakpoints = {
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
  /** Returns true if viewport >= breakpoint key. */
  isAbove(key) {
    return window.matchMedia(`(min-width: ${this[key]}px)`).matches;
  },
  /** Returns true if viewport < breakpoint key. */
  isBelow(key) {
    return window.matchMedia(`(max-width: ${this[key] - 1}px)`).matches;
  },
};

import { Icon } from './components/index.js';
import * as DS from './components/index.js';

export {
  Icon,
  Button, IconButton, Text, Heading, Label, Link,
  Card, CardHeader, CardContent, CardFooter,
  Avatar, Badge, Chip, Divider, Separator,
  Container, Stack, Flex, Grid, Box, Surface, Paper,
  Spinner, Skeleton, Tooltip,
  Input, Textarea, Password, Checkbox, Switch, Radio,
  Select, Autocomplete, Search, DatePicker, TimePicker, RangePicker,
  OTPInput, Slider, Upload, ImageUpload,
  NumberInput, CurrencyInput, PhoneInput, EmailInput, Combobox,
  HelperText, ValidationMessage, CharacterCounter,
  Navbar, Sidebar, BottomNavigation, Topbar, CommandPalette, ResponsiveNavigation,
  Tabs, Breadcrumb, Pagination, Menu, Dropdown, Drawer, Sheet,
  Dialog, Modal, ConfirmationDialog, Alert, Toast, Snackbar, Banner, Popover, LoadingOverlay,
  Progress, Loading, EmptyState, ErrorState, SuccessState,
  Table, DataGrid, AdvancedDataTable, Timeline, List, DescriptionList,
  StatisticCard, MetricCard, ChartContainer, MapContainer,
  DriverMarker, CustomerMarker, TripPolyline, HeatmapInterface, BaseMarker, LocationPin, LocationPicker,
  ZoomControls, Compass, CurrentLocationButton, FloatingMapControls, RoutePreview,
  MetricWidget, AnalyticsCard, DashboardWidget, FilterBar, SearchBar, CommandBar,
  NotificationBell, ActivityFeed, AuditTimeline, StatusIndicator, LiveStatusBadge,
  KPIGrid, ResizablePanel, SplitView, DockPanel,
  LineChart, BarChart, AreaChart, PieChart, DonutChart, Gauge, Heatmap, Sparkline,
  ChartLegend, ChartTooltip, KPICard, EmptyChart, LoadingChart,
  Accordion, Collapse, TreeView, VirtualList,
  AppShell, DashboardLayout, AuthLayout, MapLayout,
  SplitLayout, ResponsiveContainer, ResponsiveGrid, ResponsiveSidebar,
} from './components/index.js';

export default {
  theme, tokens, breakpoints, Icon,
  ...DS,
};

import '@testing-library/jest-dom/vitest';

// Minimal ResizeObserver mock so recharts ResponsiveContainer can measure in jsdom.
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ target: el, contentRect: { width: 600, height: 300 } }]); }
    unobserve() {}
    disconnect() {}
  };
}

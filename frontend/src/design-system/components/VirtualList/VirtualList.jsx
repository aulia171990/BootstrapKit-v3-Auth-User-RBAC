import React, { useState, useRef, useCallback, useMemo } from 'react';
import { cx } from '../_util.js';
import '../../components/__data.css';
import './VirtualList.css';

/**
 * VirtualList — windowed list for large datasets (only visible rows render).
 * @param {Array} items data
 * @param {function(item, index)} renderRow
 * @param {number} itemHeight fixed row height (px)
 * @param {number} height viewport height (px)
 * @param {number} overscan extra rows above/below
 */
export default function VirtualList({ items = [], renderRow, itemHeight = 40, height = 320, overscan = 4, className, ...rest }) {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef(null);

  const total = items.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
  const endIndex = Math.min(total, startIndex + visibleCount);

  const onScroll = useCallback((e) => setScrollTop(e.currentTarget.scrollTop), []);

  const slice = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  return (
    <div
      ref={ref}
      className={cx('ds-vlist', className)}
      style={{ height, overflowY: 'auto' }}
      onScroll={onScroll}
      role="list"
      {...rest}
    >
      <div style={{ height: total * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {slice.map((it, i) => (
            <div key={startIndex + i} role="listitem" style={{ height: itemHeight }}>
              {renderRow(it, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState, useCallback } from 'react';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * SplitView — two resizable panes with a drag gutter.
 * @param {'row'|'col'} direction split axis (row = side-by-side, col = stacked)
 * @param {ReactNode} start / end the two panes
 * @param {number} defaultRatio initial ratio 0..1 for the first pane
 */
export default function SplitView({ direction = 'row', start, end, defaultRatio = 0.5, className, ...rest }) {
  const [ratio, setRatio] = useState(defaultRatio);
  const ref = useRef(null);
  const startPos = useRef(null);

  const onDown = useCallback((e) => {
    startPos.current = direction === 'row' ? e.clientX : e.clientY;
    const move = (ev) => {
      if (!ref.current || startPos.current == null) return;
      const rect = ref.current.getBoundingClientRect();
      const cur = direction === 'row' ? ev.clientX : ev.clientY;
      const total = direction === 'row' ? rect.width : rect.height;
      const r = (cur - rect.left) / total;
      setRatio(Math.min(0.85, Math.max(0.15, r)));
    };
    const up = () => { startPos.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [direction]);

  return (
    <div ref={ref} className={cx('ds-split', direction === 'col' && 'ds-split--col', className)} {...rest}>
      <div className="ds-split__pane" style={{ [direction === 'row' ? 'width' : 'height']: `${ratio * 100}%`, flex: 'none' }}>{start}</div>
      <div className={cx('ds-split__gutter', direction === 'col' && 'ds-split__gutter--col')} onMouseDown={onDown} role="separator" aria-orientation={direction === 'row' ? 'vertical' : 'horizontal'} tabIndex={0} />
      <div className="ds-split__pane" style={{ flex: '1 1 0%' }}>{end}</div>
    </div>
  );
}

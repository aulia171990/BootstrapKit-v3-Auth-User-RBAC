import React, { useRef, useState, useCallback } from 'react';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * ResizablePanel — collapsible panel with a drag handle (vertical resize).
 * @param {boolean} collapsible show collapse toggle in header
 * @param {ReactNode} actions header actions
 * @param {'row'|'col'} resize resize axis (height / width)
 */
export default function ResizablePanel({ title, actions, children, collapsible = false, resize = 'row', defaultSize, className, ...rest }) {
  const [size, setSize] = useState(defaultSize);
  const [collapsed, setCollapsed] = useState(false);
  const ref = useRef(null);
  const start = useRef(null);

  const onDown = useCallback((e) => {
    start.current = { y: e.clientY, x: e.clientX, h: ref.current?.offsetHeight || 0, w: ref.current?.offsetWidth || 0 };
    const move = (ev) => {
      if (!start.current) return;
      const d = resize === 'row' ? ev.clientY - start.current.y : ev.clientX - start.current.x;
      const next = resize === 'row' ? Math.max(60, start.current.h + d) : Math.max(120, start.current.w + d);
      setSize(next);
    };
    const up = () => { start.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [resize]);

  const style = { [resize === 'row' ? 'height' : 'width']: collapsed ? undefined : size, flex: size == null ? '1 1 0%' : '0 0 auto' };
  return (
    <section className={cx('ds-panel', className)} ref={ref} {...rest}>
      <header className="ds-panel__head">
        {title && <span className="ds-panel__title">{title}</span>}
        <span style={{ display: 'flex', gap: 'var(--ds-space-1)', marginLeft: 'auto' }}>
          {actions}
          {collapsible && (
            <button type="button" className="ds-dock__btn" aria-label={collapsed ? 'Expand' : 'Collapse'} onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? '▢' : '—'}
            </button>
          )}
        </span>
      </header>
      {!collapsed && <div className="ds-panel__body" style={style}>{children}</div>}
      {!collapsed && <div className={cx('ds-panel__resizer', resize === 'col' && 'ds-panel__resizer--col')} onMouseDown={onDown} role="separator" aria-orientation={resize === 'row' ? 'horizontal' : 'vertical'} tabIndex={0} />}
    </section>
  );
}

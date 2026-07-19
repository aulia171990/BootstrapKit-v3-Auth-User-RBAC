import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__data.css';
import './Collapse.css';

/**
 * Collapse — single expandable panel (header + animated body).
 * @param {ReactNode} title header content
 * @param {ReactNode} children body
 * @param {boolean} defaultOpen
 * @param {boolean} open controlled
 * @param {function(boolean)} onOpenChange
 */
export default function Collapse({ title, children, defaultOpen = false, open: openProp, onOpenChange, disabled, className, ...rest }) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = openProp ?? internal;
  const bodyRef = useRef(null);
  const [h, setH] = useState(isOpen ? 'auto' : 0);

  useEffect(() => { setH(isOpen ? (bodyRef.current?.scrollHeight ?? 'auto') : 0); }, [isOpen, children]);

  const toggle = () => { const v = !isOpen; if (openProp === undefined) setInternal(v); onOpenChange?.(v); };

  return (
    <div className={cx('ds-collapse', isOpen && 'is-open', disabled && 'is-disabled', className)} {...rest}>
      <button type="button" className="ds-collapse__header" aria-expanded={isOpen} disabled={disabled} onClick={toggle}>
        <span className="ds-collapse__title">{title}</span>
        <span className="ds-collapse__chevron" aria-hidden="true"><Icon icon={ChevronDown} size="sm" /></span>
      </button>
      <div className="ds-collapse__body" style={{ height: h }} aria-hidden={!isOpen}>
        <div className="ds-collapse__inner" ref={bodyRef}>{children}</div>
      </div>
    </div>
  );
}

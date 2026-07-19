import React, { useState } from 'react';
import Collapse from '../Collapse/index.js';
import { cx } from '../_util.js';
import '../../components/__data.css';

/**
 * Accordion — stack of Collapse panels.
 * items: [{ id, title, content, disabled? }]
 * @param {boolean} multiple allow more than one open (default false)
 * @param {Array<string>} value controlled open ids
 * @param {function(Array<string>)} onValueChange
 */
export default function Accordion({ items = [], multiple = false, value, onValueChange, defaultValue, className, ...rest }) {
  const [internal, setInternal] = useState(defaultValue ?? []);
  const open = value ?? internal;

  const toggle = (id) => {
    let next;
    if (multiple) next = open.includes(id) ? open.filter((x) => x !== id) : [...open, id];
    else next = open.includes(id) ? [] : [id];
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <div className={cx('ds-accordion', className)} {...rest}>
      {items.map((it) => (
        <Collapse
          key={it.id}
          title={it.title}
          disabled={it.disabled}
          open={open.includes(it.id)}
          onOpenChange={(o) => o && toggle(it.id)}
        >
          {it.content}
        </Collapse>
      ))}
    </div>
  );
}

import React from 'react';
import { cx } from '../_util.js';
import '../../components/__data.css';

/**
 * Timeline — vertical event feed.
 * items: [{ id?, tone?, title, time?, body? }]
 */
export default function Timeline({ items = [], className, ...rest }) {
  return (
    <ul className={cx('ds-timeline', className)} {...rest}>
      {items.map((it, i) => (
        <li key={it.id ?? i} className="ds-timeline__item" data-tone={it.tone}>
          <span className="ds-timeline__dot" aria-hidden="true" />
          <div className="ds-timeline__title">{it.title}</div>
          {it.time && <div className="ds-timeline__time">{it.time}</div>}
          {it.body && <div className="ds-timeline__body">{it.body}</div>}
        </li>
      ))}
    </ul>
  );
}

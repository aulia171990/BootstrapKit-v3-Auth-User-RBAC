import React from 'react';
import Spinner from '../Spinner/index.js';
import { cx } from '../_util.js';
import './Card.css';

/**
 * Card — surface container with header/body/footer, hover, clickable, loading.
 * @param {('xs'|'sm'|'md'|'lg'|'xl'|'none')} elevation shadow
 * @param {('sm'|'md'|'lg'|'xl')} radius
 * @param {1..24} padding inner padding (use 0 for custom)
 * @param {boolean} hover interactive hover lift
 * @param {boolean} clickable adds role/button affordances (use with onClick)
 * @param {boolean} loading shows overlay spinner
 */
export default function Card({
  children, elevation = 'md', radius = 'lg', padding = 6,
  hover = false, clickable = false, loading = false,
  as: Tag = 'div', className, onClick, ...rest
}) {
  const interactive = clickable || !!onClick;
  return (
    <Tag
      className={cx('ds-card', className, (hover || interactive) && 'is-interactive')}
      data-elevation={elevation}
      data-radius={radius}
      style={{ '--ds-card-pad': padding === 0 ? undefined : `var(--ds-space-${padding})` }}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) { e.preventDefault(); onClick(e); } } : undefined}
      {...rest}
    >
      {children}
      {loading && (
        <div className="ds-card__loading" role="status" aria-live="polite">
          <Spinner size="md" />
        </div>
      )}
    </Tag>
  );
}

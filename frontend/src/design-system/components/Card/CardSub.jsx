import React from 'react';
import { cx } from '../_util.js';
import './Card.css';

/** CardHeader — title/actions row of a Card. */
export function CardHeader({ title, subtitle, avatar, actions, className, ...rest }) {
  return (
    <div className={cx('ds-card__header', className)} {...rest}>
      <div className="ds-card__heading">
        {avatar}
        <div>
          {title && <div className="ds-card__title">{title}</div>}
          {subtitle && <div className="ds-card__subtitle">{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="ds-card__actions">{actions}</div>}
    </div>
  );
}

/** CardContent — main padded body of a Card. */
export function CardContent({ padding = 6, className, ...rest }) {
  return <div className={cx('ds-card__content', className)} style={{ padding: `var(--ds-space-${padding})` }} {...rest} />;
}

/** CardFooter — action/summary row pinned to the bottom of a Card. */
export function CardFooter({ className, ...rest }) {
  return <div className={cx('ds-card__footer', className)} {...rest} />;
}

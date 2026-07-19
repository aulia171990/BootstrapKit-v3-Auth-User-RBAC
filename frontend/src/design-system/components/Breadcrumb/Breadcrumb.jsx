import React from 'react';
import { ChevronRight } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Breadcrumb — hierarchical path.
 * items: [{ label, href? }] — last item is current (no link).
 * @param {ReactNode} separator default ChevronRight
 */
export default function Breadcrumb({ items = [], separator, className, ...rest }) {
  return (
    <nav aria-label="Breadcrumb" className={cx('ds-breadcrumb', className)} {...rest}>
      {items.map((it, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <span className={cx('ds-breadcrumb__item', isLast && 'is-current')} aria-current={isLast ? 'page' : undefined}>
              {it.href && !isLast ? <a href={it.href}>{it.label}</a> : it.label}
            </span>
            {!isLast && (
              <span className="ds-breadcrumb__sep" aria-hidden="true">
                {separator ? <Icon icon={separator} size="xs" /> : <ChevronRight size={14} />}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

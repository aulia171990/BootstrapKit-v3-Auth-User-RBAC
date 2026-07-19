import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Pagination — page navigation with ellipsis.
 * @param {number} page current page (1-based)
 * @param {number} totalPages
 * @param {function(number)} onPageChange
 */
export default function Pagination({ page = 1, totalPages = 1, onPageChange, className, ...rest }) {
  const go = (p) => { if (p >= 1 && p <= totalPages && p !== page) onPageChange?.(p); };

  // Build visible pages with ellipsis
  const pages = [];
  const push = (p) => pages.push(p);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (page > 3) push('…1');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i);
    if (page < totalPages - 2) push('…2');
    push(totalPages);
  }

  return (
    <ul className={cx('ds-pagination', className)} {...rest}>
      <li>
        <button type="button" className="ds-pagination__item" disabled={page === 1} onClick={() => go(page - 1)} aria-label="Previous page">
          <Icon icon={ChevronLeft} size="sm" />
        </button>
      </li>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <li key={i}>
            <button type="button" className={cx('ds-pagination__item', p === page && 'is-active')} aria-current={p === page ? 'page' : undefined} onClick={() => go(p)}>{p}</button>
          </li>
        ) : (
          <li key={i} className="ds-pagination__ellipsis" aria-hidden="true">…</li>
        )
      )}
      <li>
        <button type="button" className="ds-pagination__item" disabled={page === totalPages} onClick={() => go(page + 1)} aria-label="Next page">
          <Icon icon={ChevronRight} size="sm" />
        </button>
      </li>
    </ul>
  );
}

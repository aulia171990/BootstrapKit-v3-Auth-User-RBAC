import React from 'react';
import { cx } from '../_util.js';
import '../../components/__data.css';

/**
 * DescriptionList — label/detail pairs (definition list).
 * items: [{ term, detail, width? (label column) }]
 */
export default function DescriptionList({ items = [], labelWidth, className, ...rest }) {
  return (
    <dl className={cx('ds-desc', className)} style={labelWidth ? { '--ds-desc-label-w': labelWidth } : undefined} {...rest}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <dt className="ds-desc__term">{it.term}</dt>
          <dd className="ds-desc__detail">{it.detail}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

import React from 'react';
import { cx } from '../_util.js';
import '../typography.css';

/**
 * Link — accessible anchor styled by tokens.
 * @param {('primary'|'secondary'|'muted'|'danger')} tone
 * @param {boolean} underline always / hover / none
 * @param {boolean} external adds target=_blank + rel
 */
export default function Link({ children, tone = 'primary', underline = 'hover', external = false, className, ...rest }) {
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a
      className={cx('ds-link', `ds-link--${tone}`, `ds-link--u-${underline}`, className)}
      {...externalProps}
      {...rest}
    >
      {children}
    </a>
  );
}

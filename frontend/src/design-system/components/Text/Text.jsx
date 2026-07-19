import React from 'react';
import { cx, TONE_VAR } from '../_util.js';
import './Text.css';

/**
 * Text — body / caption / label typography primitive.
 * @param {string} variant body | body-sm | caption | label | overline
 * @param {string} tone    semantic color (defaults to inherit)
 * @param {boolean} strong render as <strong>
 */
export default function Text({
  variant = 'body',
  tone = 'inherit',
  strong = false,
  as,
  className,
  children,
  ...rest
}) {
  const Tag = as || (strong ? 'strong' : 'span');
  return (
    <Tag
      className={cx('ds-text', `ds-text--${variant}`, className)}
      style={{ color: TONE_VAR[tone] || tone }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

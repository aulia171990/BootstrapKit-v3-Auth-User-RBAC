import React from 'react';
import { cx } from '../_util.js';
import './Heading.css';

/**
 * Heading — responsive display/heading/title/subtitle.
 * @param {string} level display | heading | title | subtitle
 * @param {1|2|3|4|5|6} as which HTML heading tag to render
 */
export default function Heading({
  level = 'title',
  as,
  className,
  children,
  ...rest
}) {
  const Tag = as || (level === 'display' ? 'h1' : level === 'heading' ? 'h1' : level === 'title' ? 'h2' : 'h3');
  return (
    <Tag className={cx('ds-heading', `ds-heading--${level}`, className)} {...rest}>
      {children}
    </Tag>
  );
}

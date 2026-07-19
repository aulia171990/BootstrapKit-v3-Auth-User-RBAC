import React from 'react';
import Select from '../Select/index.js';
import Search from '../Search/index.js';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * FilterBar — row of filters (selects, search, custom controls).
 * @param {Array<{key,label,options,value,onChange,placeholder?}>} filters
 * @param {function} onSearch optional search handler
 * @param {ReactNode} children extra controls
 */
export default function FilterBar({ filters = [], onSearch, searchPlaceholder = 'Search…', children, className, ...rest }) {
  return (
    <div className={cx('ds-filterbar', className)} {...rest}>
      {onSearch && <Search aria-label="Filter search" placeholder={searchPlaceholder} onChange={(e) => onSearch(e.target.value)} />}
      {filters.map((f) => (
        <Select
          key={f.key}
          aria-label={f.label}
          placeholder={f.placeholder || f.label}
          options={f.options}
          value={f.value}
          onChange={(e) => f.onChange?.(e.target.value)}
        />
      ))}
      {children}
    </div>
  );
}

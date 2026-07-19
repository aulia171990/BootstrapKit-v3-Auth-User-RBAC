import React from 'react';
import Search from '../Search/index.js';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/** SearchBar — prominent search row (input + optional action slot). */
export default function SearchBar({ value, onChange, onSearch, placeholder = 'Search…', action, className, ...rest }) {
  return (
    <form className={cx('ds-searchbar', className)} aria-label="Search form" onSubmit={(e) => { e.preventDefault(); onSearch?.(value); }} {...rest}>
      <Search
        aria-label="Search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {action}
    </form>
  );
}

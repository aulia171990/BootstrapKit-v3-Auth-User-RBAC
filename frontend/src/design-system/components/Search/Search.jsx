import React, { forwardRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/** Search — search input with icon + optional clear button. */
const Search = forwardRef(function Search(
  { onClear, className, placeholder = 'Search…', ...rest },
  ref,
) {
  return (
    <div className={cx('ds-control-wrap', 'has-icon', className)}>
      <span className="ds-control-wrap__icon"><Icon icon={SearchIcon} size="sm" /></span>
      <input
        ref={ref}
        type="search"
        className="ds-control"
        placeholder={placeholder}
        {...rest}
      />
      {onClear && (
        <button type="button" className="ds-control-wrap__toggle" onClick={onClear} aria-label="Clear search" style={{ right: 0 }}>
          <Icon icon={SearchIcon} size="xs" />
        </button>
      )}
    </div>
  );
});

export default Search;

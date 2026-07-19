import React from 'react';
import { Search } from 'lucide-react';
import SearchInput from '../Search/index.js';
import LocationPin from '../LocationPin/index.js';
import { cx } from '../_util.js';
import '../_maps/_maps.css';

/**
 * LocationPicker — search + selectable results list.
 * @param {Array<{id,title,subtitle,position?}>} results
 * @param {string|number} value selected id
 * @param {function(id, item)} onSelect
 */
export default function LocationPicker({ results = [], value, onSelect, placeholder = 'Search location…', className, ...rest }) {
  return (
    <div className={cx('ds-locpicker', className)} {...rest}>
      <SearchInput aria-label="Search location" placeholder={placeholder} />
      <div className="ds-locpicker__results" role="listbox">
        {results.map((r) => (
          <LocationPin key={r.id} title={r.title} subtitle={r.subtitle} active={value === r.id} onClick={() => onSelect?.(r.id, r)} role="option" aria-selected={value === r.id} />
        ))}
      </div>
    </div>
  );
}

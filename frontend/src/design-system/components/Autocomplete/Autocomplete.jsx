import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Icon from '../Icon/index.js';
import HelperText from '../HelperText/index.js';
import ValidationMessage from '../ValidationMessage/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * Autocomplete — text input with filtered dropdown suggestions.
 * @param {Array<{value,label}>} options full option list
 * @param {function(value)} onSelect called with chosen option value
 */
const Autocomplete = forwardRef(function Autocomplete(
  { label, hint, error, placeholder = 'Type to search…', options = [], onSelect, invalid, className, id, helperText, ...rest },
  ref,
) {
  const fieldId = id || rest.name || `ds-ac-${Math.random().toString(36).slice(2)}`;
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const state = error || invalid ? 'error' : undefined;

  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (o) => { setQ(o.label); setOpen(false); setActive(-1); onSelect?.(o.value); };

  const onKey = (e) => {
    if (!open && e.key === 'ArrowDown') { setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(filtered[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div className={cx('ds-field', className)} data-state={state}>
      {label && <label className="ds-field__label" htmlFor={fieldId}>{label}</label>}
      <div className="ds-control-wrap has-icon" ref={wrapRef}>
        <span className="ds-control-wrap__icon"><Icon icon={SearchIcon} size="sm" /></span>
        <input
          ref={ref}
          id={fieldId}
          className="ds-control"
          value={q}
          placeholder={placeholder}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${fieldId}-list`}
          aria-invalid={state === 'error' || undefined}
          {...rest}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="ds-autocomplete__list" id={`${fieldId}-list`} role="listbox">
          {filtered.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={i === active}
              className={cx('ds-autocomplete__opt', i === active && 'is-active')}
              onMouseDown={(e) => { e.preventDefault(); choose(o); }}
              onMouseEnter={() => setActive(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
      {(hint || helperText) && !error && <HelperText>{hint || helperText}</HelperText>}
      {error && <ValidationMessage>{error}</ValidationMessage>}
    </div>
  );
});

export default Autocomplete;

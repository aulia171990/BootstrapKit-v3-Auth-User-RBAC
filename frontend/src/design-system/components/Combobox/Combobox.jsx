import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * Combobox — multi-select with checkable dropdown + token chips.
 * @param {Array<string>} value selected values
 * @param {function(Array<string>)} onChange
 * @param {Array<{value,label}>} options
 */
const Combobox = forwardRef(function Combobox(
  { label, hint, error, placeholder = 'Select…', options = [], value = [], onChange, invalid, className, id, ...rest },
  ref,
) {
  const fieldId = id || rest.name || `ds-combo-${Math.random().toString(36).slice(2)}`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const state = error || invalid ? 'error' : undefined;

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = (v) => {
    onChange?.(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  const remove = (v) => onChange?.(value.filter((x) => x !== v));

  const selected = options.filter((o) => value.includes(o.value));

  return (
    <div className={cx('ds-field', className)} data-state={state}>
      {label && (
        <label className="ds-field__label" htmlFor={fieldId}>{label}</label>
      )}
      <div className="ds-combo" ref={wrapRef}>
        <div
          className="ds-combo__box"
          onClick={() => setOpen((o) => !o)}
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={open}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        >
          {selected.length === 0 && <span className="ds-combo__placeholder">{placeholder}</span>}
          {selected.map((o) => (
            <span key={o.value} className="ds-combo__chip">
              {o.label}
              <button
                type="button"
                className="ds-combo__chip-x"
                aria-label={`Remove ${o.label}`}
                onClick={(e) => { e.stopPropagation(); remove(o.value); }}
              >
                <Icon icon={X} size="xs" />
              </button>
            </span>
          ))}
        </div>
        {open && (
          <ul className="ds-combo__list" role="listbox" aria-multiselectable="true" id={fieldId}>
            {options.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={value.includes(o.value)}
                className={cx('ds-combo__opt', value.includes(o.value) && 'is-selected')}
                onClick={() => toggle(o.value)}
              >
                <span className="ds-combo__check">{value.includes(o.value) && <Icon icon={Check} size="xs" />}</span>
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && !error && <span className="ds-field__hint">{hint}</span>}
      {error && <span className="ds-field__error">{error}</span>}
    </div>
  );
});

export default Combobox;

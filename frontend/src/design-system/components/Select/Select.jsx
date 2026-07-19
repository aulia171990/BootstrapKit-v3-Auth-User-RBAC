import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Icon from '../Icon/index.js';
import HelperText from '../HelperText/index.js';
import ValidationMessage from '../ValidationMessage/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/** Select — native select with token styling + chevron. */
const Select = forwardRef(function Select(
  { label, hint, error, required, options = [], invalid, className, id, placeholder, helperText, ...rest },
  ref,
) {
  const fieldId = id || rest.name;
  const state = error || invalid ? 'error' : undefined;
  return (
    <div className={cx('ds-field', className)} data-state={state}>
      {label && (
        <label className="ds-field__label" htmlFor={fieldId}>
          {label}{required && <span className="ds-field__req">*</span>}
        </label>
      )}
      <div className="ds-control-wrap has-select">
        <select
          ref={ref}
          id={fieldId}
          className="ds-control ds-select"
          aria-invalid={state === 'error' || undefined}
          aria-describedby={helperText || hint ? `${fieldId}-hint` : undefined}
          required={required}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        <span className="ds-control-wrap__icon ds-select__chevron"><Icon icon={ChevronDown} size="sm" /></span>
      </div>
      {(hint || helperText) && !error && <HelperText id={`${fieldId}-hint`}>{hint || helperText}</HelperText>}
      {error && <ValidationMessage>{error}</ValidationMessage>}
    </div>
  );
});

export default Select;

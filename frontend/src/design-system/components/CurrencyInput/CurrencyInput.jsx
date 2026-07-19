import React, { forwardRef } from 'react';
import Input from '../Input/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * CurrencyInput — numeric money field with currency symbol prefix.
 * @param {number|string} value
 * @param {function(string)} onChange emits raw numeric string (allows empty)
 * @param {string} currency symbol/prefix (e.g. "Rp", "$")
 * @param {string} locale formatting locale for thousands separator (display only)
 */
const CurrencyInput = forwardRef(function CurrencyInput(
  { value, onChange, currency = 'Rp', locale = 'id-ID', disabled, className, ...rest },
  ref,
) {
  const numeric = String(value ?? '').replace(/[^\d.]/g, '');
  const formatted = numeric !== ''
    ? Number(numeric).toLocaleString(locale, { maximumFractionDigits: 0 })
    : '';

  const control = (
    <div className={cx('ds-control-wrap', 'has-icon', disabled && 'is-disabled', className)}>
      <span className="ds-control-wrap__icon ds-currency__sym">{currency}</span>
      <input
        ref={ref}
        inputMode="numeric"
        className="ds-control"
        value={formatted}
        disabled={disabled}
        placeholder="0"
        onChange={(e) => onChange?.(e.target.value.replace(/[^\d.]/g, ''))}
        {...rest}
      />
    </div>
  );

  if (rest.label || rest.hint || rest.error || rest.required) {
    return (
      <Input
        ref={ref}
        inputMode="numeric"
        value={formatted}
        disabled={disabled}
        leftIcon={undefined}
        prefixEl={<span className="ds-currency__sym">{currency}</span>}
        onChange={(e) => onChange?.(e.target.value.replace(/[^\d.]/g, ''))}
        {...rest}
      />
    );
  }
  return control;
});

export default CurrencyInput;

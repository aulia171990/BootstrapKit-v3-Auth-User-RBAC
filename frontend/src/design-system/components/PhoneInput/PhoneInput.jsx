import React, { forwardRef } from 'react';
import { Phone } from 'lucide-react';
import Input from '../Input/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * PhoneInput — telephone field with country code prefix + mask hint.
 * @param {string} value raw digits (no formatting stored)
 * @param {function(string)} onChange emits digits only
 * @param {string} countryCode prefix shown (e.g. "+62")
 */
const PhoneInput = forwardRef(function PhoneInput(
  { value, onChange, countryCode = '+62', disabled, className, ...rest },
  ref,
) {
  const control = (
    <div className={cx('ds-control-wrap', 'has-icon', 'ds-phone', disabled && 'is-disabled', className)}>
      <span className={cx('ds-control-wrap__icon ds-phone__cc')}>{countryCode}</span>
      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        className="ds-control"
        value={value ?? ''}
        disabled={disabled}
        placeholder="812-3456-7890"
        onChange={(e) => onChange?.(e.target.value.replace(/[^\d]/g, ''))}
        {...rest}
      />
    </div>
  );

  if (rest.label || rest.hint || rest.error || rest.required) {
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        value={value ?? ''}
        disabled={disabled}
        leftIcon={Phone}
        prefixEl={<span className="ds-phone__cc-inline">{countryCode}</span>}
        onChange={(e) => onChange?.(e.target.value.replace(/[^\d]/g, ''))}
        {...rest}
      />
    );
  }
  return control;
});

export default PhoneInput;

import React, { forwardRef } from 'react';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/** Radio — single radio option (group via shared name). */
const Radio = forwardRef(function Radio(
  { label, checked, disabled, className, id, ...rest },
  ref,
) {
  const rid = id || rest.name;
  return (
    <label className={cx('ds-radio', className, disabled && 'is-disabled')} htmlFor={rid}>
      <input
        ref={ref}
        id={rid}
        type="radio"
        className="ds-radio__input"
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <span className="ds-radio__dot" aria-hidden="true" />
      {label && <span className="ds-radio__label">{label}</span>}
    </label>
  );
});

export default Radio;

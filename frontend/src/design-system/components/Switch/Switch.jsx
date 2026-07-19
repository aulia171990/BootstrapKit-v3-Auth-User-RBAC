import React, { forwardRef } from 'react';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/** Switch — on/off toggle. */
const Switch = forwardRef(function Switch(
  { checked, disabled, label, className, id, ...rest },
  ref,
) {
  const sid = id || rest.name;
  return (
    <label className={cx('ds-switch', className, disabled && 'is-disabled')} htmlFor={sid}>
      <input
        ref={ref}
        id={sid}
        type="checkbox"
        role="switch"
        className="ds-switch__input"
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <span className="ds-switch__track" aria-hidden="true"><span className="ds-switch__thumb" /></span>
      {label && <span className="ds-switch__label">{label}</span>}
    </label>
  );
});

export default Switch;

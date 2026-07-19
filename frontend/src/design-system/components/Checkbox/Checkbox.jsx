import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/** Checkbox — labeled checkbox with custom token-driven appearance. */
const Checkbox = forwardRef(function Checkbox(
  { label, checked, disabled, className, id, ...rest },
  ref,
) {
  const cid = id || rest.name;
  return (
    <label className={cx('ds-check', className, disabled && 'is-disabled')} htmlFor={cid}>
      <input
        ref={ref}
        id={cid}
        type="checkbox"
        className="ds-check__input"
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <span className="ds-check__box" aria-hidden="true">
        <Icon icon={Check} size="xs" className="ds-check__tick" />
      </span>
      {label && <span className="ds-check__label">{label}</span>}
    </label>
  );
});

export default Checkbox;

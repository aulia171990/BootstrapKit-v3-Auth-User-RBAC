import React, { forwardRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import Icon from '../Icon/index.js';
import Input from '../Input/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * NumberInput — numeric field with optional stepper buttons.
 * @param {number} value controlled value
 * @param {function(number)} onChange receives parsed number (or '' when empty)
 * @param {boolean} stepper show +/- buttons
 */
const NumberInput = forwardRef(function NumberInput(
  { value, onChange, min, max, step = 1, stepper = true, disabled, className, ...rest },
  ref,
) {
  const clamp = (n) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const set = (n) => onChange?.(Number.isNaN(n) ? '' : clamp(n));
  const dec = () => set((Number(value) || 0) - step);
  const inc = () => set((Number(value) || 0) + step);

  const control = (
    <>
      {stepper && !disabled && (
        <button type="button" className="ds-num__step" aria-label="Decrease" tabIndex={-1} onClick={dec}>
          <Icon icon={Minus} size="xs" />
        </button>
      )}
      <input
        ref={ref}
        type="number"
        className="ds-control ds-num__input"
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))}
        {...rest}
      />
      {stepper && !disabled && (
        <button type="button" className="ds-num__step" aria-label="Increase" tabIndex={-1} onClick={inc}>
          <Icon icon={Plus} size="xs" />
        </button>
      )}
    </>
  );

  // If the consumer passed label/hint/error, wrap with Input's field chrome.
  if (rest.label || rest.hint || rest.error || rest.required) {
    return (
      <Input
        ref={ref}
        type="number"
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))}
        {...rest}
      />
    );
  }
  return <div className={cx('ds-num', stepper && 'has-stepper', disabled && 'is-disabled', className)}>{control}</div>;
});

export default NumberInput;

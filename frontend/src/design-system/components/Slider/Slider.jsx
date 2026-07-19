import React, { forwardRef } from 'react';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * Slider — range input with token styling + value bubble.
 * @param {number} value current value
 * @param {function(number)} onChange
 */
const Slider = forwardRef(function Slider(
  { value = 0, min = 0, max = 100, step = 1, disabled, onChange, className, ...rest },
  ref,
) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      ref={ref}
      type="range"
      className={cx('ds-slider', className)}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(e) => onChange?.(Number(e.target.value))}
      style={{ '--ds-slider-pct': `${pct}%` }}
      {...rest}
    />
  );
});

export default Slider;

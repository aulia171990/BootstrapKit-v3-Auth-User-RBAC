import React, { forwardRef, useRef, useState } from 'react';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * OTP Input — segmented one-time-password entry.
 * @param {number} length number of digits (default 6)
 * @param {function(string)} onChange emits the joined code
 */
const OTPInput = forwardRef(function OTPInput(
  { length = 6, value = '', onChange, invalid, disabled, autoFocus = true, className, ...rest },
  ref,
) {
  const inputs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const set = (i, ch) => {
    const next = digits.slice();
    next[i] = ch;
    onChange?.(next.join('').slice(0, length));
    if (ch && i < length - 1) inputs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (/^[0-9]$/.test(e.key)) set(i, e.key);
  };
  const onPaste = (e) => {
    e.preventDefault();
    const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange?.(txt);
    inputs.current[Math.min(txt.length, length - 1)]?.focus();
  };

  return (
    <div className={cx('ds-otp', className)} role="group" aria-label="OTP verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          className={cx('ds-otp__cell', invalid && 'is-invalid')}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => set(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          aria-label={`Digit ${i + 1}`}
          {...rest}
        />
      ))}
    </div>
  );
});

export default OTPInput;

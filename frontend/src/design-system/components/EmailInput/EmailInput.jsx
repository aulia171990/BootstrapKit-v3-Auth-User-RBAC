import React, { forwardRef, useEffect } from 'react';
import { Mail } from 'lucide-react';
import Input from '../Input/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * EmailInput — email field (type=email) with mail icon + built-in format validation.
 * @param {string} value
 * @param {function(string)} onChange
 * @param {function(string|null)} onValidate optional; receives error message or null
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EmailInput = forwardRef(function EmailInput(
  { value, onChange, onValidate, required, invalid, error, className, ...rest },
  ref,
) {
  const validate = (v) => {
    if (!onValidate) return;
    if (v === '') onValidate(required ? 'Email is required' : null);
    else if (!EMAIL_RE.test(v)) onValidate('Enter a valid email address');
    else onValidate(null);
  };
  useEffect(() => { validate(value ?? ''); /* eslint-disable-next-line */ }, []);

  const handle = (e) => {
    const v = e.target.value;
    onChange?.(v);
    validate(v);
  };
  return (
    <Input
      ref={ref}
      type="email"
      inputMode="email"
      value={value ?? ''}
      leftIcon={Mail}
      required={required}
      invalid={invalid || !!error}
      error={error}
      onChange={handle}
      className={className}
      {...rest}
    />
  );
});

export default EmailInput;

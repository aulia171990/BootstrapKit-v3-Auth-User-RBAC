import React, { forwardRef, useId } from 'react';
import { Clock } from 'lucide-react';
import Icon from '../Icon/index.js';
import HelperText from '../HelperText/index.js';
import ValidationMessage from '../ValidationMessage/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * TimePicker — time input with clock icon (wraps native type=time).
 * @param {string} value ISO time (HH:mm)
 */
const TimePicker = forwardRef(function TimePicker(
  { label, hint, error, required, invalid, className, id, helperText, ...rest },
  ref,
) {
  const fieldId = id || rest.name || useId();
  const state = error || invalid ? 'error' : undefined;
  return (
    <div className={cx('ds-field', className)} data-state={state}>
      {label && (
        <label className="ds-field__label" htmlFor={fieldId}>
          {label}{required && <span className="ds-field__req">*</span>}
        </label>
      )}
      <div className="ds-control-wrap has-icon">
        <span className="ds-control-wrap__icon"><Icon icon={Clock} size="sm" /></span>
        <input
          ref={ref}
          id={fieldId}
          type="time"
          className="ds-control ds-date"
          aria-invalid={state === 'error' || undefined}
          aria-describedby={helperText || hint ? `${fieldId}-hint` : undefined}
          required={required}
          {...rest}
        />
      </div>
      {(hint || helperText) && !error && <HelperText id={`${fieldId}-hint`}>{hint || helperText}</HelperText>}
      {error && <ValidationMessage>{error}</ValidationMessage>}
    </div>
  );
});

export default TimePicker;

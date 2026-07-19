import React, { forwardRef } from 'react';
import HelperText from '../HelperText/index.js';
import ValidationMessage from '../ValidationMessage/index.js';
import CharacterCounter from '../CharacterCounter/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/** Textarea — multi-line text field with optional character counter. */
const Textarea = forwardRef(function Textarea(
  { label, hint, error, required, invalid, rows = 4, maxLength, counter = true, className, id, value, ...rest },
  ref,
) {
  const fieldId = id || rest.name;
  const state = error || invalid ? 'error' : undefined;
  const len = typeof value === 'string' ? value.length : 0;
  const showCounter = maxLength && counter;
  return (
    <div className={cx('ds-field', className)} data-state={state}>
      {label && (
        <label className="ds-field__label" htmlFor={fieldId}>
          {label}{required && <span className="ds-field__req">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className="ds-control"
        style={{ resize: 'vertical', minHeight: 'var(--ds-space-12)' }}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={error ? `${fieldId}-err` : (hint || showCounter) ? `${fieldId}-hint` : undefined}
        required={required}
        {...rest}
      />
      <div className="ds-field__footer">
        {(hint && !error) && <HelperText>{hint}</HelperText>}
        {error && <ValidationMessage>{error}</ValidationMessage>}
        {showCounter && <CharacterCounter value={len} max={maxLength} className="ds-field__counter" />}
      </div>
    </div>
  );
});

export default Textarea;

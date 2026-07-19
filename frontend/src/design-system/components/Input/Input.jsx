import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import Icon from '../Icon/index.js';
import Spinner from '../Spinner/index.js';
import HelperText from '../HelperText/index.js';
import ValidationMessage from '../ValidationMessage/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * Input — text field with label/helper/validation/icon/loading.
 * @param {ReactElement} leftIcon lucide icon component
 * @param {ReactNode} helperText neutral guidance (renders via HelperText)
 * @param {ReactNode} validationMessage error text (renders via ValidationMessage, role=alert)
 * @param {ReactNode} prefixEl element rendered inside the control before text (e.g. currency/phone code)
 */
const Input = forwardRef(function Input(
  {
    label, hint, error, required, leftIcon, loading, invalid,
    helperText, validationMessage, prefixEl, className, id, children, ...rest
  },
  ref,
) {
  const fieldId = id || rest.name;
  const state = error || invalid || validationMessage ? 'error' : undefined;
  const helpId = `${fieldId}-hint`;
  const errId = `${fieldId}-err`;
  return (
    <div className={cx('ds-field', className)} data-state={state}>
      {label && (
        <label className="ds-field__label" htmlFor={fieldId}>
          {label}{required && <span className="ds-field__req">*</span>}
        </label>
      )}
      <div className={cx('ds-control-wrap', leftIcon && 'has-icon', (error || validationMessage) && 'has-error')}>
        {leftIcon && (
          <span className="ds-control-wrap__icon">
            <Icon icon={leftIcon} size="sm" />
          </span>
        )}
        {prefixEl && <span className="ds-control-wrap__prefix">{prefixEl}</span>}
        <input
          ref={ref}
          id={fieldId}
          className="ds-control"
          aria-invalid={state === 'error' || undefined}
          aria-describedby={
            validationMessage ? errId : (hint || helperText) ? helpId : undefined
          }
          required={required}
          {...rest}
        />
        {loading && (
          <span className="ds-control-wrap__spinner">
            <Spinner size="sm" />
          </span>
        )}
      </div>
      {children}
      {(hint || helperText) && !validationMessage && (
        <HelperText id={helpId}>{hint || helperText}</HelperText>
      )}
      {(error || validationMessage) && (
        <ValidationMessage id={errId}>{error || validationMessage}</ValidationMessage>
      )}
    </div>
  );
});

export default Input;

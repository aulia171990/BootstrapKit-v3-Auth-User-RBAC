import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * RangePicker — start/end date pair with calendar icons.
 * @param {string} startValue ISO date
 * @param {string} endValue ISO date
 * @param {function(string)} onStartChange
 * @param {function(string)} onEndChange
 */
const RangePicker = forwardRef(function RangePicker(
  { label, hint, error, required, invalid, startValue, endValue, onStartChange, onEndChange, className, id, startId, endId, ...rest },
  ref,
) {
  const fieldId = id || rest.name;
  const state = error || invalid ? 'error' : undefined;
  const sid = startId || `${fieldId}-start`;
  const eid = endId || `${fieldId}-end`;
  return (
    <div className={cx('ds-field', className)} data-state={state}>
      {label && (
        <label className="ds-field__label">{label}{required && <span className="ds-field__req">*</span>}</label>
      )}
      <div className="ds-range">
        <div className="ds-control-wrap has-icon">
          <span className="ds-control-wrap__icon"><Icon icon={Calendar} size="sm" /></span>
          <input
            ref={ref}
            id={sid}
            type="date"
            className="ds-control ds-date"
            value={startValue ?? ''}
            aria-label="Start date"
            aria-invalid={state === 'error' || undefined}
            onChange={(e) => onStartChange?.(e.target.value)}
          />
        </div>
        <span className="ds-range__sep" aria-hidden="true">→</span>
        <div className="ds-control-wrap has-icon">
          <span className="ds-control-wrap__icon"><Icon icon={Calendar} size="sm" /></span>
          <input
            id={eid}
            type="date"
            className="ds-control ds-date"
            value={endValue ?? ''}
            aria-label="End date"
            aria-invalid={state === 'error' || undefined}
            onChange={(e) => onEndChange?.(e.target.value)}
          />
        </div>
      </div>
      {hint && !error && <span className="ds-field__hint">{hint}</span>}
      {error && <span className="ds-field__error">{error}</span>}
    </div>
  );
});

export default RangePicker;

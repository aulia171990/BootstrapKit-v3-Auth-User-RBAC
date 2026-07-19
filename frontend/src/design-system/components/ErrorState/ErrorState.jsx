import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Icon from '../Icon/index.js';
import Button from '../Button/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

/**
 * ErrorState — error / failure block.
 * @param {ReactNode} icon @param {ReactNode} title @param {ReactNode} description
 * @param {ReactNode} action (e.g. retry <Button>)
 */
export default function ErrorState({ icon, title = 'Something went wrong', description, action, className, ...rest }) {
  return (
    <div className={cx('ds-state', className)} data-tone="error" {...rest}>
      <span className="ds-state__icon"><Icon icon={icon ?? AlertTriangle} size="xl" /></span>
      <h3 className="ds-state__title">{title}</h3>
      {description && <p className="ds-state__desc">{description}</p>}
      {action && <div className="ds-state__actions">{action}</div>}
    </div>
  );
}

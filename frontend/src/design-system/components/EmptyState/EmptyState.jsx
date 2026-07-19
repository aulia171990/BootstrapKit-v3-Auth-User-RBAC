import React from 'react';
import { Inbox, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Icon from '../Icon/index.js';
import Button from '../Button/index.js';
import { cx } from '../_util.js';
import '../../components/__feedback.css';

/**
 * EmptyState — neutral "nothing here" block.
 * @param {ReactNode} icon @param {ReactNode} title @param {ReactNode} description
 * @param {ReactNode} action (e.g. <Button>)
 */
export default function EmptyState({ icon, title = 'Nothing here yet', description, action, className, ...rest }) {
  return (
    <div className={cx('ds-state', className)} data-tone="empty" {...rest}>
      <span className="ds-state__icon"><Icon icon={icon ?? Inbox} size="xl" /></span>
      <h3 className="ds-state__title">{title}</h3>
      {description && <p className="ds-state__desc">{description}</p>}
      {action && <div className="ds-state__actions">{action}</div>}
    </div>
  );
}

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import Icon from '../Icon/index.js';
import Dropdown from '../Dropdown/index.js';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * NotificationBell — bell trigger with unread count + dropdown list.
 * @param {Array<{id,title,body?,time?,unread?,icon?}>} items
 * @param {function(id)} onRead
 */
export default function NotificationBell({ items = [], onRead, className, ...rest }) {
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => i.unread).length;
  return (
    <div className={cx('ds-bell', className)} {...rest}>
      <Dropdown open={open} onOpenChange={setOpen} align="end" trigger={
        <button type="button" className="ds-bell__trigger ds-map-button" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <Icon icon={Bell} size="sm" />
          {unread > 0 && <span className="ds-bell__count">{unread > 9 ? '9+' : unread}</span>}
        </button>
      }>
        <div className="ds-bell__menu" role="menu">
          {items.length === 0 && <div className="ds-bell__empty">No notifications</div>}
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              className={cx('ds-bell__item', n.unread && 'ds-bell__item--unread')}
              role="menuitem"
              onClick={() => onRead?.(n.id)}
            >
              {n.icon && <span className="ds-metric-widget__icon" style={{ width: 28, height: 28 }}><Icon icon={n.icon} size="xs" /></span>}
              <span style={{ flex: 1 }}>
                <span className="ds-bell__title">{n.title}</span>
                {n.body && <div className="ds-bell__time">{n.body}</div>}
                {n.time && <div className="ds-bell__time">{n.time}</div>}
              </span>
            </button>
          ))}
        </div>
      </Dropdown>
    </div>
  );
}

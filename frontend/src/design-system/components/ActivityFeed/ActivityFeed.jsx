import React from 'react';
import Avatar from '../Avatar/index.js';
import { cx } from '../_util.js';
import '../_enterprise/_enterprise.css';

/**
 * ActivityFeed — avatar + text activity stream.
 * @param {Array<{id,user,avatar?,action,target?,time?,tone?}>} items
 */
export default function ActivityFeed({ items = [], className, ...rest }) {
  return (
    <div className={cx('ds-activity', className)} {...rest}>
      {items.map((it) => (
        <div key={it.id} className="ds-activity__item">
          <Avatar src={it.avatar} name={it.user} size="sm" />
          <div className="ds-activity__body">
            <div className="ds-activity__title">
              <strong>{it.user}</strong> {it.action}{it.target && <> <span>{it.target}</span></>}
            </div>
            {it.time && <div className="ds-activity__meta">{it.time}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

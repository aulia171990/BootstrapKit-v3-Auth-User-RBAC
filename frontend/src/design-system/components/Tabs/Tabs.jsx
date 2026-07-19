import React, { useState } from 'react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';

/**
 * Tabs — accessible tab list + panels.
 * tabs: [{ id, label, icon?, disabled?, content }]
 * @param {string} value controlled active id
 * @param {function(id)} onValueChange
 */
export default function Tabs({ tabs = [], value, onValueChange, defaultValue, className, ...rest }) {
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id);
  const active = value ?? internal;
  const select = (id) => { if (value === undefined) setInternal(id); onValueChange?.(id); };
  return (
    <div className={cx('ds-tabs', className)} {...rest}>
      <div className="ds-tabs__list" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            disabled={t.disabled}
            aria-selected={active === t.id}
            className={cx('ds-tabs__tab', active === t.id && 'is-active')}
            onClick={() => select(t.id)}
          >
            {t.icon && <Icon icon={t.icon} size="sm" />}
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        active === t.id && <div key={t.id} role="tabpanel" className="ds-tabs__panel">{t.content}</div>
      ))}
    </div>
  );
}

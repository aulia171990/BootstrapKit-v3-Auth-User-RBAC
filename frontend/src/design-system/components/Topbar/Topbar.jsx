import React from 'react';
import { Search, Bell } from 'lucide-react';
import Icon from '../Icon/index.js';
import Avatar from '../Avatar/index.js';
import Dropdown from '../Dropdown/index.js';
import Menu from '../Menu/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';
import './Topbar.css';

/**
 * Topbar — top application bar: brand + global search + actions + user menu.
 * @param {ReactNode} brand logo/title (left)
 * @param {ReactNode} actions extra right-aligned actions
 * @param {ReactNode} user optional user node (rendered with Avatar + Dropdown menu)
 * @param {Array} userMenu items for the user dropdown (Menu schema)
 * @param {function(string)} onSearch global search submit
 * @param {boolean} sticky default true
 */
export default function Topbar({ brand, actions, searchPlaceholder = 'Search…', onSearch, user, userMenu = [], notifications, className, sticky = true, ...rest }) {
  return (
    <header
      className={cx('ds-topbar', className)}
      style={sticky ? { position: 'sticky', top: 0, zIndex: 'var(--ds-z-sticky)' } : undefined}
      {...rest}
    >
      <div className="ds-topbar__brand">{brand}</div>
      <form className="ds-topbar__search" role="search" onSubmit={(e) => { e.preventDefault(); onSearch?.(e.currentTarget.search.value); }}>
        <Icon icon={Search} size="sm" />
        <input name="search" type="search" placeholder={searchPlaceholder} className="ds-topbar__search-input" />
      </form>
      <div className="ds-topbar__actions">
        {notifications && (
          <button type="button" className="ds-topbar__icon-btn" aria-label="Notifications">
            <Icon icon={Bell} size="md" />
            {typeof notifications === 'number' && notifications > 0 && <span className="ds-topbar__badge">{notifications}</span>}
          </button>
        )}
        {actions}
        {user && (
          userMenu.length ? (
            <Dropdown trigger={user}>
              <Menu items={userMenu} />
            </Dropdown>
          ) : user
        )}
      </div>
    </header>
  );
}

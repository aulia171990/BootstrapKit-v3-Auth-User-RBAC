import React, { useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import Icon from '../Icon/index.js';
import Sidebar from '../Sidebar/index.js';
import Drawer from '../Drawer/index.js';
import { cx } from '../_util.js';
import '../../components/__nav.css';
import './ResponsiveNavigation.css';

/**
 * ResponsiveNav — adaptive shell navigation.
 * On desktop (>= breakpoint) renders the Sidebar inline; on mobile it collapses
 * to a hamburger that opens the Sidebar inside a left Drawer.
 * @param {Array} items Sidebar item schema
 * @param {ReactNode} brand
 * @param {number} breakpoint px threshold to switch to mobile (default 768)
 */
export default function ResponsiveNav({ items = [], brand, breakpoint = 768, className, ...rest }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < breakpoint : false);

  // track viewport
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  const sidebar = <Sidebar items={items} brand={brand} />;

  return (
    <div className={cx('ds-responsive-nav', className)} {...rest}>
      {isMobile ? (
        <>
          <button type="button" className="ds-responsive-nav__toggle" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>
            <Icon icon={MenuIcon} size="md" />
          </button>
          <Drawer open={open} onClose={() => setOpen(false)} title={brand} side="left">
            {sidebar}
          </Drawer>
        </>
      ) : (
        sidebar
      )}
    </div>
  );
}

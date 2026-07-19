import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import { usePortal, useFocusTrap } from '../_overlay.js';
import '../../components/__nav.css';
import './CommandPalette.css';

/** Tiny subsequence fuzzy score: lower = better, Infinity = no match. */
function fuzzy(query, text) {
  if (!query) return 0;
  const q = query.toLowerCase(), t = text.toLowerCase();
  let qi = 0, score = 0, last = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) { if (last >= 0) score += ti - last; last = ti; qi++; }
  }
  return qi === q.length ? score : Infinity;
}

/**
 * CommandPalette — ⌘K / Ctrl-K quick command surface.
 * @param {boolean} open
 * @param {function} onClose
 * @param {Array} commands [{ id, label, icon?, group?, hint?, onSelect }]
 * @param {string} placeholder
 */
export default function CommandPalette({ open, onClose, commands = [], placeholder = 'Type a command…', className, ...rest }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const panelRef = useRef(null);
  useFocusTrap(panelRef, open);

  // global hotkey
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); onClose && !open ? null : (open ? onClose?.() : null); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const scored = commands
      .map((c) => ({ c, s: fuzzy(query, c.label) }))
      .filter((x) => x.s !== Infinity)
      .sort((a, b) => a.s - b.s)
      .map((x) => x.c);
    return scored;
  }, [commands, query]);

  useEffect(() => { setActive(0); }, [query, open]);

  if (!open) return null;

  const choose = (cmd) => { if (!cmd) return; onClose?.(); cmd.onSelect?.(cmd); };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose?.(); }
  };

  const content = (
    <div className="ds-overlay" onClick={onClose} aria-hidden="true">
      <div
        ref={panelRef}
        className={cx('ds-cmdk', className)}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        {...rest}
      >
        <div className="ds-cmdk__search">
          <Icon icon={Search} size="sm" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="ds-cmdk__input"
            role="combobox"
            aria-expanded="true"
            aria-controls="ds-cmdk-list"
            aria-activedescendant={results[active] ? `ds-cmdk-opt-${results[active].id}` : undefined}
          />
          <kbd className="ds-cmdk__hint">ESC</kbd>
        </div>
        <ul className="ds-cmdk__list" id="ds-cmdk-list" role="listbox">
          {results.length === 0 && <li className="ds-cmdk__empty">No results</li>}
          {results.map((cmd, i) => (
            <li
              key={cmd.id}
              id={`ds-cmdk-opt-${cmd.id}`}
              role="option"
              aria-selected={i === active}
              className={cx('ds-cmdk__option', i === active && 'is-active')}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(cmd)}
            >
              {cmd.icon && <span className="ds-cmdk__option-icon"><Icon icon={cmd.icon} size="sm" /></span>}
              <span className="ds-cmdk__option-label">{cmd.label}</span>
              {cmd.hint && <kbd className="ds-cmdk__hint">{cmd.hint}</kbd>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return usePortal(content, open);
}

import React, { useState, useCallback } from 'react';
import { ChevronRight, Folder, File as FileIcon } from 'lucide-react';
import Icon from '../Icon/index.js';
import { cx } from '../_util.js';
import '../../components/__data.css';
import './TreeView.css';

/**
 * TreeView — hierarchical, expandable nodes.
 * nodes: [{ id, label, icon?, children?, disabled? }]
 * @param {function(id, node)} onSelect
 * @param {Array} defaultExpanded ids
 * @param {string} selectedId
 */
export default function TreeView({ nodes = [], onSelect, selectedId, defaultExpanded = [], className, ...rest }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = (id) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const isOpen = (id) => expanded.includes(id);

  const renderNode = useCallback((node, depth) => {
    const hasChildren = node.children?.length > 0;
    const open = isOpen(node.id);
    return (
      <li key={node.id} className="ds-tree__node">
        <div
          className={cx('ds-tree__row', selectedId === node.id && 'is-selected', node.disabled && 'is-disabled')}
          style={{ paddingLeft: `calc(var(--ds-space-2) + ${depth * 18}px)` }}
          role="treeitem"
          aria-expanded={hasChildren ? open : undefined}
          aria-selected={selectedId === node.id}
          tabIndex={0}
          onClick={() => { if (node.disabled) return; if (hasChildren) toggle(node.id); onSelect?.(node.id, node); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (hasChildren) toggle(node.id); onSelect?.(node.id, node); }
            else if (e.key === 'ArrowRight' && hasChildren && !open) toggle(node.id);
            else if (e.key === 'ArrowLeft' && hasChildren && open) toggle(node.id);
          }}
        >
          <span className={cx('ds-tree__caret', hasChildren && 'is-caret', open && 'is-open')} aria-hidden="true">
            {hasChildren && <Icon icon={ChevronRight} size="xs" />}
          </span>
          <span className="ds-tree__icon">{node.icon ? <Icon icon={node.icon} size="sm" /> : (hasChildren ? <Icon icon={Folder} size="sm" /> : <Icon icon={FileIcon} size="sm" />)}</span>
          <span className="ds-tree__label">{node.label}</span>
        </div>
        {hasChildren && open && (
          <ul className="ds-tree__children" role="group">{node.children.map((c) => renderNode(c, depth + 1))}</ul>
        )}
      </li>
    );
  }, [expanded, selectedId, onSelect]);

  return (
    <ul className={cx('ds-tree', className)} role="tree" {...rest}>
      {nodes.map((n) => renderNode(n, 0))}
    </ul>
  );
}

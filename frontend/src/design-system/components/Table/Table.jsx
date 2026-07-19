import React from 'react';
import { cx } from '../_util.js';
import '../../components/__data.css';

/**
 * Table — semantic data table.
 * columns: [{ key, header, align?, render?(row), sortable?, width? }]
 * @param {Array} data row objects
 * @param {string} emptyText shown when no rows
 * @param {function(key)} onSort called with column key (toggle handled by consumer)
 * @param {string} sortBy active sort key @param {'asc'|'desc'} sortDir
 */
export default function Table({ columns = [], data = [], rowKey, emptyText = 'No data', onSort, sortBy, sortDir, className, ...rest }) {
  return (
    <div className={cx('ds-table-wrap', className)} {...rest}>
      <table className="ds-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: c.align, width: c.width }} aria-sort={sortBy === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}>
                {c.sortable ? (
                  <span className="ds-grid__sort" data-dir={sortBy === c.key ? sortDir : undefined} onClick={() => onSort?.(c.key)}>{c.header}</span>
                ) : c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td className="ds-table__empty" colSpan={columns.length}>{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={rowKey ? row[rowKey] : i}>
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align }}>{c.render ? c.render(row, i) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

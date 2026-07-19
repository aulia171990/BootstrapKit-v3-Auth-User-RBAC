import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Icon from '../Icon/index.js';
import Table from '../Table/index.js';
import Search from '../Search/index.js';
import Select from '../Select/index.js';
import Pagination from '../Pagination/index.js';
import { cx } from '../_util.js';
import '../../components/__data.css';
import './AdvancedDataTable.css';

/**
 * AdvancedDataTable — Table with client-side sort, search, column filter, row selection, paging.
 * columns: [{ key, header, align?, render?(row), sortable?, filterable?, width?, filterOptions? }]
 * @param {Array} data source rows
 * @param {string} rowKey field used as unique key (default 'id')
 * @param {boolean} selectable show row checkboxes + select-all
 * @param {Array} selected controlled selected keys
 * @param {function(Array)} onSelectedChange
 * @param {number} pageSize default 10
 */
export default function AdvancedDataTable({
  columns = [], data = [], rowKey = 'id', selectable = false, selected = undefined,
  onSelectedChange, searchable = true, pageSize = 10, page: pageProp, onPageChange, className, ...rest
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [filters, setFilters] = useState({});
  const [internalPage, setInternalPage] = useState(1);
  const [internalSel, setInternalSel] = useState([]);
  const page = pageProp ?? internalPage;
  const sel = selected ?? internalSel;
  const setSel = (v) => { if (selected === undefined) setInternalSel(v); onSelectedChange?.(v); };
  const setPage = (v) => { if (pageProp === undefined) setInternalPage(v); onPageChange?.(v); };

  const toggleSort = (key) => {
    setSort((s) => {
      if (s.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc') return { key, dir: 'desc' };
      return { key: null, dir: 'asc' };
    });
    setPage(1);
  };

  const processed = useMemo(() => {
    let rows = [...data];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => columns.some((c) => String(r[c.key] ?? (c.render ? c.render(r) : '')).toLowerCase().includes(q)));
    }
    Object.entries(filters).forEach(([k, v]) => { if (v) rows = rows.filter((r) => String(r[k]) === String(v)); });
    if (sort.key) {
      const dir = sort.dir === 'asc' ? 1 : -1;
      rows.sort((a, b) => { const x = a[sort.key], y = b[sort.key]; return (x > y ? 1 : x < y ? -1 : 0) * dir; });
    }
    return rows;
  }, [data, query, filters, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const view = processed.slice((page - 1) * pageSize, page * pageSize);

  const allVisibleSelected = view.length > 0 && view.every((r) => sel.includes(r[rowKey]));
  const toggleAll = () => setSel(allVisibleSelected ? sel.filter((k) => !view.some((r) => r[rowKey] === k)) : [...new Set([...sel, ...view.map((r) => r[rowKey])])]);
  const toggleRow = (k) => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k]);

  const SortIcon = ({ active, dir }) => active
    ? (dir === 'asc' ? <Icon icon={ArrowUp} size="xs" /> : <Icon icon={ArrowDown} size="xs" />)
    : <Icon icon={ArrowUpDown} size="xs" />;

  const sortColumns = columns.map((c) => c.sortable ? { ...c, header: (
    <span className="ds-adt__sort" role="button" tabIndex={0}
      onClick={() => toggleSort(c.key)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort(c.key); } }}>
      {c.header}
      <span className="ds-adt__sort-icon"><SortIcon active={sort.key === c.key} dir={sort.dir} /></span>
    </span>
  ) } : c);

  const selectCol = selectable ? [{ key: '__sel', header: <input type="checkbox" aria-label="Select all" checked={allVisibleSelected} onChange={toggleAll} />, width: 40, render: (r) => <input type="checkbox" aria-label={`Select row ${r[rowKey]}`} checked={sel.includes(r[rowKey])} onChange={() => toggleRow(r[rowKey])} /> }] : [];

  return (
    <div className={cx('ds-adt', className)} {...rest}>
      <div className="ds-adt__toolbar">
        {searchable && <Search value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search…" style={{ flex: 1, maxWidth: 280 }} />}
        {columns.filter((c) => c.filterable).map((c) => (
          <Select key={c.key} aria-label={`Filter ${c.header}`} placeholder={`Filter ${c.header}`} options={c.filterOptions || []} onChange={(v) => { setFilters((f) => ({ ...f, [c.key]: v })); setPage(1); }} />
        ))}
        <span style={{ flex: 1 }} />
        {selectable && <span className="ds-adt__count">{sel.length} selected</span>}
        <Select aria-label="Rows per page" options={[10, 20, 50].map((n) => ({ value: n, label: `${n} / page` }))} defaultValue={pageSize} />
      </div>
      <Table columns={[...selectCol, ...sortColumns]} data={view} rowKey={rowKey} emptyText="No results" />
      {processed.length > 0 && (
        <div className="ds-adt__pager">
          <span>{processed.length} item(s)</span>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

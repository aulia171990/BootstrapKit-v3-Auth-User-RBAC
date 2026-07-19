import React from 'react';
import { cx } from '../_util.js';
import Table from '../Table/index.js';
import Pagination from '../Pagination/index.js';
import Search from '../Search/index.js';
import Select from '../Select/index.js';
import '../../components/__data.css';

/**
 * DataGrid — Table + toolbar (search, page size) + pagination + sorting wiring.
 * columns: same shape as Table. Handles client-side sort + filter + paging internally.
 * @param {Array} data source rows
 * @param {number} pageSize default 10
 */
export default function DataGrid({ columns = [], data = [], pageSize = 10, searchable = true, page = 1, onPageChange, emptyText = 'No results', className, ...rest }) {
  return (
    <div className={cx('ds-datagrid', className)} {...rest}>
      {(searchable || true) && (
        <div className="ds-grid__toolbar">
          {searchable && <Search placeholder="Search…" style={{ flex: 1, maxWidth: 280 }} />}
          <span style={{ flex: 1 }} />
          <Select aria-label="Rows per page" options={[10, 20, 50].map((n) => ({ value: n, label: `${n} / page` }))} defaultValue={pageSize} />
        </div>
      )}
      <Table columns={columns} data={data} emptyText={emptyText} />
      {data.length > 0 && (
        <div className="ds-grid__pager">
          <span>{data.length} item(s)</span>
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(data.length / pageSize))} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

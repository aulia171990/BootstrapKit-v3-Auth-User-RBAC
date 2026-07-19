import React, { useState } from 'react';
import { Plus, Folder, File as FileIcon, Search } from 'lucide-react';
import {
  Table, DataGrid, AdvancedDataTable, Timeline, List, DescriptionList,
  StatisticCard, MetricCard, Accordion, Collapse, TreeView, VirtualList,
} from '../index.js';

const cols = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', filterable: true, filterOptions: [{ value: 'Driver', label: 'Driver' }, { value: 'Admin', label: 'Admin' }] },
];
const rows = [
  { id: 1, name: 'Ayu', role: 'Driver' },
  { id: 2, name: 'Budi', role: 'Admin' },
  { id: 3, name: 'Citra', role: 'Driver' },
];

export const DataExamples = () => {
  const [sel, setSel] = useState([]);
  const big = Array.from({ length: 5000 }, (_, i) => ({ id: i, label: `Row ${i}` }));
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Table columns={cols} data={rows} rowKey="id" />
      <DataGrid columns={cols} data={rows} pageSize={2} />
      <AdvancedDataTable columns={cols} data={rows} selectable selected={sel} onSelectedChange={setSel} pageSize={10} />
      <Timeline items={[{ id: '1', title: 'Order created', time: '10:00', body: 'by Ayu' }, { id: '2', title: 'Driver assigned', time: '10:05' }]} />
      <List items={[{ id: '1', title: 'Item A', leading: Plus }, { id: '2', title: 'Item B' }]} />
      <DescriptionList items={[{ term: 'Status', detail: 'Active' }, { term: 'Plan', detail: 'Pro' }]} />
      <StatisticCard value="1.2k" label="Users" delta={12} />
      <MetricCard icon={Plus} label="Revenue" value="$9k" delta={-4} />
      <Accordion items={[{ id: 'a', title: 'Section A', content: 'Body A' }, { id: 'b', title: 'Section B', content: 'Body B' }]} />
      <Collapse title="Standalone collapse" defaultOpen={false}><p>Collapsed body</p></Collapse>
      <TreeView nodes={[{ id: '1', label: 'Root', children: [{ id: '2', label: 'Child' }] }]} />
      <VirtualList items={big} itemHeight={32} height={260} renderRow={(it) => <div style={{ padding: '0 12px' }}>{it.label}</div>} />
    </div>
  );
};

export default DataExamples;

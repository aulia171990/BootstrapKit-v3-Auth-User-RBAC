import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ChevronRight, Folder, File as FileIcon, Plus } from 'lucide-react';
import Table from '../components/Table/index.js';
import DataGrid from '../components/DataGrid/index.js';
import AdvancedDataTable from '../components/AdvancedDataTable/index.js';
import Timeline from '../components/Timeline/index.js';
import List from '../components/List/index.js';
import DescriptionList from '../components/DescriptionList/index.js';
import StatisticCard from '../components/StatisticCard/index.js';
import MetricCard from '../components/MetricCard/index.js';
import Accordion from '../components/Accordion/index.js';
import Collapse from '../components/Collapse/index.js';
import TreeView from '../components/TreeView/index.js';
import VirtualList from '../components/VirtualList/index.js';

const cols = [{ key: 'name', header: 'Name', sortable: true }, { key: 'role', header: 'Role' }];
const rows = [{ id: 1, name: 'Ayu', role: 'Driver' }, { id: 2, name: 'Budi', role: 'Admin' }, { id: 3, name: 'Citra', role: 'Driver' }];

describe('Data display (2E) — reused 1G components', () => {
  it('Table renders headers + rows', () => {
    render(<Table columns={cols} data={rows} rowKey="id" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Ayu')).toBeInTheDocument();
  });
  it('DataGrid renders toolbar + table', () => {
    render(<DataGrid columns={cols} data={rows} pageSize={2} />);
    expect(screen.getByText('Ayu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
  });
  it('Timeline renders items', () => {
    render(<Timeline items={[{ id: '1', title: 'Order created', time: '10:00' }]} />);
    expect(screen.getByText('Order created')).toBeInTheDocument();
  });
  it('List renders items', () => {
    render(<List items={[{ id: '1', title: 'Item A', leading: Plus }]} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
  });
  it('DescriptionList renders term/detail', () => {
    render(<DescriptionList items={[{ term: 'Status', detail: 'Active' }]} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  it('StatisticCard renders value + delta', () => {
    render(<StatisticCard value="1.2k" label="Users" delta={12} />);
    expect(screen.getByText('1.2k')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });
  it('MetricCard renders label', () => {
    render(<MetricCard icon={Plus} label="Revenue" value="$9k" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });
});

describe('Data display (2E) — new components', () => {
  it('Collapse toggles open state', () => {
    render(<Collapse title="Section" defaultOpen={false}><p>Body</p></Collapse>);
    const btn = screen.getByRole('button', { name: /Section/ });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
  it('Accordion single-open by default', () => {
    render(<Accordion items={[{ id: 'a', title: 'A', content: 'a' }, { id: 'b', title: 'B', content: 'b' }]} />);
    const btns = screen.getAllByRole('button');
    fireEvent.click(btns[0]);
    fireEvent.click(btns[1]);
    expect(btns[0]).toHaveAttribute('aria-expanded', 'false');
    expect(btns[1]).toHaveAttribute('aria-expanded', 'true');
  });
  it('TreeView expands node + selects', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={[{ id: '1', label: 'Root', children: [{ id: '2', label: 'Child' }] }]} onSelect={onSelect} />);
    const root = screen.getByText('Root').closest('[role=treeitem]');
    fireEvent.click(root);
    expect(screen.getByText('Child')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Child').closest('[role=treeitem]'));
    expect(onSelect).toHaveBeenCalledWith('2', expect.anything());
  });
  it('VirtualList renders only a window of rows', () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Row ${i}` }));
    const { container } = render(<VirtualList items={data} itemHeight={30} height={300} renderRow={(it) => <div>{it.label}</div>} />);
    const rendered = container.querySelectorAll('[role=listitem]');
    expect(rendered.length).toBeLessThan(1000);
    expect(rendered.length).toBeGreaterThan(0);
    expect(screen.getByText('Row 0')).toBeInTheDocument();
  });
  it('AdvancedDataTable sorts + selects rows', () => {
    const onSel = vi.fn();
    render(<AdvancedDataTable columns={cols} data={rows} selectable onSelectedChange={onSel} pageSize={10} />);
    // sort by name
    fireEvent.click(screen.getByText('Name'));
    expect(screen.getAllByText('Ayu').length).toBeGreaterThan(0);
    // select all
    fireEvent.click(screen.getByLabelText('Select all'));
    expect(onSel).toHaveBeenCalled();
  });
});

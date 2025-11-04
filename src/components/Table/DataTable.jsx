import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import './DataTable.scss';
import {X} from 'lucide-react';

function DataTable({ data, columns, globalFilter, onGlobalFilterChange, onRowClick }) {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState(columns.map(col => col.accessorKey || col.id));
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showColumnPanel, setShowColumnPanel] = useState(false); // 🔹 Toggle state

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    state: { globalFilter, columnVisibility, columnOrder },
    onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('colIndex', index);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    const draggedFrom = e.dataTransfer.getData('colIndex');
    if (draggedFrom === '') return;
    const newOrder = [...columnOrder];
    const [moved] = newOrder.splice(draggedFrom, 1);
    newOrder.splice(index, 0, moved);
    setColumnOrder(newOrder);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleResetColumns = () => {
    setColumnOrder(columns.map(col => col.accessorKey || col.id));
    setColumnVisibility({});
  };
  
  return (
    <div className="data-table">
{/* Toggle Button */}
<button
  className="toggle-column-panel-btn"
  onClick={() =>{ setShowColumnPanel(prev => !prev); setIsRed(!isRed);}}
>
  {showColumnPanel ? 'Hide Columns' : 'Manage Columns'}
</button>

{/* Column Panel with animation */}
<div className={`column-toggle-panel ${showColumnPanel ? 'active' : ''}`}>
  <div className='panelHeader'>
    <h4>Manage Columns</h4>
    <button className="close-btn" onClick={() => setShowColumnPanel(false)}><X size={24}/></button>
  </div>
  <ul className="column-list">
    {columnOrder.map((colId, index) => {
      const column = table.getAllLeafColumns().find(c => c.id === colId);
      if (!column) return null;
      const isDragOver = dragOverIndex === index;

      return (
        <li
          key={colId}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          className={`draggable-column ${isDragOver ? 'drag-over' : ''}`}
        >
          <input
            type="checkbox"
            checked={column.getIsVisible()}
            onChange={column.getToggleVisibilityHandler()}
          />
          <span className="column-name">{column.columnDef.header}</span>
          <span className="drag-icon">☰</span>
        </li>
      );
    })}
  </ul>
  <div className='resetSection'>
    <button
  onClick={handleResetColumns}
>
  Reset Columns
</button>
  </div>
</div>

      {/* 🔽 Table Section */}
      <div className="table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize(), position: 'relative' }}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? 'sortable' : ''}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc'
                      ? ' 🔼'
                      : header.column.getIsSorted() === 'desc'
                      ? ' 🔽'
                      : header.column.getCanSort()
                      ? ' ↕️'
                      : ''}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          header.getResizeHandler()(e);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          header.getResizeHandler()(e);
                        }}
                        className="resizer"
                        style={{
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: '15px',
                          position: 'absolute',
                          cursor: 'col-resize',
                          userSelect: 'none',
                          touchAction: 'none',
                          zIndex: 10,
                        }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} onClick={onRowClick ? () => onRowClick(row.original) : undefined}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔽 Pagination */}
      <div className="pagination">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Prev
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <select
          value={table.getState().pagination.pageIndex}
          onChange={(e) => table.setPageIndex(Number(e.target.value))}
        >
          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <option key={i} value={i}>
              {i + 1}
            </option>
          ))}
        </select>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
      </div>
    </div>
  );
}

export default DataTable;
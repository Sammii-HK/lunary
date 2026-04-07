import { ReactNode } from 'react';

type ColumnType = 'text' | 'number' | 'percentage' | 'ratio';

interface Column {
  label: string;
  key: string;
  type?: ColumnType;
  align?: 'left' | 'right';
  decimals?: number;
  render?: (value: any, row: any) => ReactNode;
}

interface MetricTableProps {
  columns: Column[];
  data: Array<Record<string, any>>;
  emptyMessage?: string;
}

export function MetricTable({
  columns,
  data,
  emptyMessage = 'No data for this range.',
}: MetricTableProps) {
  const formatValue = (value: any, column: Column): string => {
    if (value == null) return '—';

    if (column.type === 'number') {
      const num = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(num) ? num.toLocaleString() : String(value);
    }

    if (column.type === 'percentage') {
      const num = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(num)) return '—';
      const decimals = column.decimals ?? 1;
      return `${num.toFixed(decimals)}%`;
    }

    if (column.type === 'ratio') {
      return String(value);
    }

    return String(value);
  };

  return (
    <table className='w-full text-left text-sm text-content-muted'>
      <thead>
        <tr className='border-b border-stroke-subtle'>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`pb-3 text-xs font-medium text-content-muted ${
                col.align === 'right' ? 'text-right' : ''
              }`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row, idx) => (
            <tr
              key={idx}
              className='border-b border-stroke-subtle/50 hover:bg-surface-elevated/20'
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 text-content-secondary ${
                    col.align === 'right' ? 'text-right' : ''
                  } ${col.align !== 'right' ? 'font-medium' : ''}`}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : formatValue(row[col.key], col)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length}
              className='py-4 text-center text-xs text-content-muted'
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

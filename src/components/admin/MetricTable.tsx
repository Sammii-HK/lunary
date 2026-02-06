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
    <table className='w-full text-left text-sm text-zinc-400'>
      <thead>
        <tr className='border-b border-zinc-800'>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`pb-3 text-xs font-medium text-zinc-400 ${
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
              className='border-b border-zinc-800/50 hover:bg-zinc-900/20'
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 text-zinc-300 ${
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
              className='py-4 text-center text-xs text-zinc-500'
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

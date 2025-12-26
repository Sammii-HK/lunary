'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface SignInfo {
  name: string;
  element: string;
  modality: string;
}

interface CompatibilityMatrixProps {
  signs: [string, SignInfo][];
}

export function CompatibilityMatrix({ signs }: CompatibilityMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  return (
    <div className='w-full overflow-x-auto'>
      <div className='min-w-[800px]'>
        <table className='w-full border-collapse'>
          <thead>
            <tr>
              <th className='p-2'></th>
              {signs.map(([key, sign], colIndex) => (
                <th
                  key={key}
                  className={`p-2 text-xs font-medium transition-colors ${
                    hoveredCell?.col === colIndex
                      ? 'text-lunary-rose-300 bg-lunary-rose-900/30'
                      : 'text-zinc-400'
                  }`}
                >
                  {sign.name.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signs.map(([key1, sign1], rowIndex) => (
              <tr key={key1}>
                <td
                  className={`p-2 text-xs font-medium transition-colors ${
                    hoveredCell?.row === rowIndex
                      ? 'text-lunary-rose-300 bg-lunary-rose-900/30'
                      : 'text-zinc-400'
                  }`}
                >
                  {sign1.name.slice(0, 3)}
                </td>
                {signs.map(([key2], colIndex) => {
                  const slug =
                    key1 <= key2
                      ? `${key1}-and-${key2}`
                      : `${key2}-and-${key1}`;
                  const isHighlighted =
                    hoveredCell?.row === rowIndex ||
                    hoveredCell?.col === colIndex;
                  const isHoveredCell =
                    hoveredCell?.row === rowIndex &&
                    hoveredCell?.col === colIndex;

                  return (
                    <td key={key2} className='p-1'>
                      <Link
                        href={`/grimoire/compatibility/${slug}`}
                        className={`block w-8 h-8 rounded border transition-colors flex items-center justify-center ${
                          isHoveredCell
                            ? 'bg-lunary-rose-700 border-lunary-rose-500'
                            : isHighlighted
                              ? 'bg-lunary-rose-900/50 border-lunary-rose-700/50'
                              : 'bg-zinc-800 border-transparent hover:bg-lunary-rose-800 hover:border-lunary-rose-600'
                        }`}
                        onMouseEnter={() =>
                          setHoveredCell({ row: rowIndex, col: colIndex })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <Heart
                          className={`h-3 w-3 transition-colors ${
                            isHoveredCell
                              ? 'text-white'
                              : isHighlighted
                                ? 'text-lunary-rose-400'
                                : 'text-zinc-600 hover:text-lunary-rose'
                          }`}
                        />
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

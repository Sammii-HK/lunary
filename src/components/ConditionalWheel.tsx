'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { WheelOfTheYearWidget } from './WheelOfTheYearWidget';

export default function ConditionalWheel() {
  const [shouldRender, setShouldRender] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIfShouldShow = () => {
      const now = dayjs();
      const sabbatDates = [
        { name: 'Samhain', month: 10, day: 31 },
        { name: 'Yule', month: 12, day: 21 },
        { name: 'Imbolc', month: 2, day: 1 },
        { name: 'Ostara', month: 3, day: 21 },
        { name: 'Beltane', month: 5, day: 1 },
        { name: 'Litha', month: 6, day: 21 },
        { name: 'Lammas or Lughnasadh', month: 8, day: 1 },
        { name: 'Mabon', month: 9, day: 21 },
      ];

      for (const sabbat of sabbatDates) {
        const sabbatDate = dayjs()
          .month(sabbat.month - 1)
          .date(sabbat.day);
        const daysDiff = sabbatDate.diff(now, 'days');

        if (daysDiff >= 0 && daysDiff <= 7) {
          setShouldRender(true);
          return;
        }
      }
      setShouldRender(false);
    };

    checkIfShouldShow();
  }, []);

  if (shouldRender === null || !shouldRender) {
    return null;
  }

  return (
    <div>
      <WheelOfTheYearWidget />
    </div>
  );
}

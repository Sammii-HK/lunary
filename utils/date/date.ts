import { months } from '../months';

export const getWrittenDate = (date: Date) => {
  const currentDate = date.toLocaleDateString('en-uk');
  const nth = (n: number) =>
    n > 3 && n < 21
      ? 'th'
      : n % 10 == 1
        ? 'st'
        : n % 10 == 2
          ? 'nd'
          : n % 10 == 3
            ? 'rd'
            : 'th';

  const dateArray = currentDate.split('/');
  const day = parseInt(dateArray[0], 10);
  const monthIndex = parseInt(dateArray[1], 10) - 1;
  const writtenDate = `${day}${nth(day)} ${months[monthIndex]}`;

  return writtenDate;
};

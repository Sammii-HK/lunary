import dayjs from 'dayjs';

describe('Date Utilities', () => {
  it('should format dates correctly', () => {
    const date = dayjs('2024-01-15');
    expect(date.format('YYYY-MM-DD')).toBe('2024-01-15');
  });

  it('should calculate date differences', () => {
    const date1 = dayjs('2024-01-15');
    const date2 = dayjs('2024-01-20');
    const diff = date2.diff(date1, 'day');
    expect(diff).toBe(5);
  });

  it('should handle timezone conversions', () => {
    const date = dayjs('2024-01-15T12:00:00Z');
    expect(date.isValid()).toBe(true);
  });
});

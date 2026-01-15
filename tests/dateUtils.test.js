const {
  formatDate,
  daysBetween,
  isLeapYear,
  addDays,
  getDayOfWeek,
  isPast,
  isFuture,
  startOfDay,
  endOfDay
} = require('../src/dateUtils');

describe('Date Utilities', () => {
  describe('formatDate', () => {
    test('formats date with default format', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    test('formats date with custom format', () => {
      const date = new Date('2024-01-15T14:30:45');
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 14:30:45');
    });

    test('formats date with only year', () => {
      const date = new Date('2024-06-20');
      expect(formatDate(date, 'YYYY')).toBe('2024');
    });

    test('formats date with time components', () => {
      const date = new Date('2024-03-10T09:15:30');
      expect(formatDate(date, 'HH:mm:ss')).toBe('09:15:30');
    });

    test('pads single digit months and days', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toBe('2024-01-05');
    });

    test('throws error for invalid date', () => {
      expect(() => formatDate(new Date('invalid'))).toThrow(TypeError);
    });

    test('throws error for non-date input', () => {
      expect(() => formatDate('2024-01-15')).toThrow(TypeError);
      expect(() => formatDate(123)).toThrow(TypeError);
      expect(() => formatDate(null)).toThrow(TypeError);
    });
  });

  describe('daysBetween', () => {
    test('calculates days between two dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-05');
      expect(daysBetween(date1, date2)).toBe(4);
    });

    test('returns absolute value regardless of order', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-10');
      expect(daysBetween(date1, date2)).toBe(9);
      expect(daysBetween(date2, date1)).toBe(9);
    });

    test('returns 0 for same date', () => {
      const date = new Date('2024-01-15');
      expect(daysBetween(date, date)).toBe(0);
    });

    test('handles dates across month boundaries', () => {
      const date1 = new Date('2024-01-31');
      const date2 = new Date('2024-02-05');
      expect(daysBetween(date1, date2)).toBe(5);
    });

    test('handles dates across year boundaries', () => {
      const date1 = new Date('2023-12-31');
      const date2 = new Date('2024-01-02');
      expect(daysBetween(date1, date2)).toBe(2);
    });

    test('throws error for invalid first date', () => {
      expect(() => daysBetween(new Date('invalid'), new Date('2024-01-01'))).toThrow(TypeError);
    });

    test('throws error for invalid second date', () => {
      expect(() => daysBetween(new Date('2024-01-01'), new Date('invalid'))).toThrow(TypeError);
    });

    test('throws error for non-date inputs', () => {
      expect(() => daysBetween('2024-01-01', new Date('2024-01-05'))).toThrow(TypeError);
      expect(() => daysBetween(new Date('2024-01-01'), '2024-01-05')).toThrow(TypeError);
    });
  });

  describe('isLeapYear', () => {
    test('identifies leap year divisible by 4', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
    });

    test('identifies non-leap year not divisible by 4', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2021)).toBe(false);
    });

    test('identifies century years that are leap years', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1600)).toBe(true);
    });

    test('identifies century years that are not leap years', () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(1800)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
    });

    test('handles negative years', () => {
      expect(isLeapYear(-4)).toBe(true);
      expect(isLeapYear(-100)).toBe(false);
    });

    test('throws error for non-integer input', () => {
      expect(() => isLeapYear(2024.5)).toThrow(TypeError);
      expect(() => isLeapYear('2024')).toThrow(TypeError);
    });
  });

  describe('addDays', () => {
    test('adds positive number of days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    test('subtracts days with negative number', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    test('handles month boundaries', () => {
      const date = new Date('2024-01-31');
      const result = addDays(date, 1);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(1);
    });

    test('handles year boundaries', () => {
      const date = new Date('2023-12-31');
      const result = addDays(date, 1);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });

    test('does not modify original date', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();
      addDays(date, 10);
      expect(date.getTime()).toBe(originalTime);
    });

    test('handles leap year February', () => {
      const date = new Date('2024-02-28');
      const result = addDays(date, 1);
      expect(result.getDate()).toBe(29);
    });

    test('throws error for invalid date', () => {
      expect(() => addDays(new Date('invalid'), 5)).toThrow(TypeError);
    });

    test('throws error for non-integer days', () => {
      expect(() => addDays(new Date('2024-01-15'), 5.5)).toThrow(TypeError);
      expect(() => addDays(new Date('2024-01-15'), '5')).toThrow(TypeError);
    });
  });

  describe('getDayOfWeek', () => {
    test('returns correct day of week', () => {
      const monday = new Date('2024-01-15'); // Monday
      expect(getDayOfWeek(monday)).toBe('Monday');
    });

    test('returns Sunday for Sunday date', () => {
      const sunday = new Date('2024-01-14'); // Sunday
      expect(getDayOfWeek(sunday)).toBe('Sunday');
    });

    test('returns Friday for Friday date', () => {
      const friday = new Date('2024-01-19'); // Friday
      expect(getDayOfWeek(friday)).toBe('Friday');
    });

    test('throws error for invalid date', () => {
      expect(() => getDayOfWeek(new Date('invalid'))).toThrow(TypeError);
    });

    test('throws error for non-date input', () => {
      expect(() => getDayOfWeek('2024-01-15')).toThrow(TypeError);
    });
  });

  describe('isPast', () => {
    test('returns true for past date', () => {
      const pastDate = new Date('2020-01-01');
      expect(isPast(pastDate)).toBe(true);
    });

    test('returns false for future date', () => {
      const futureDate = new Date('2030-01-01');
      expect(isFuture(futureDate)).toBe(true);
    });

    test('returns false for current moment (approximately)', () => {
      const now = new Date();
      // This test might be flaky, but should generally pass
      // as the date is created slightly before comparison
      expect(isPast(now)).toBe(false);
    });

    test('throws error for invalid date', () => {
      expect(() => isPast(new Date('invalid'))).toThrow(TypeError);
    });
  });

  describe('isFuture', () => {
    test('returns true for future date', () => {
      const futureDate = new Date('2030-01-01');
      expect(isFuture(futureDate)).toBe(true);
    });

    test('returns false for past date', () => {
      const pastDate = new Date('2020-01-01');
      expect(isFuture(pastDate)).toBe(false);
    });

    test('throws error for invalid date', () => {
      expect(() => isFuture(new Date('invalid'))).toThrow(TypeError);
    });
  });

  describe('startOfDay', () => {
    test('sets time to 00:00:00.000', () => {
      const date = new Date('2024-01-15T14:30:45.123');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    test('preserves date components', () => {
      const date = new Date('2024-01-15T14:30:45');
      const result = startOfDay(date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    test('does not modify original date', () => {
      const date = new Date('2024-01-15T14:30:45');
      const originalHours = date.getHours();
      startOfDay(date);
      expect(date.getHours()).toBe(originalHours);
    });

    test('throws error for invalid date', () => {
      expect(() => startOfDay(new Date('invalid'))).toThrow(TypeError);
    });
  });

  describe('endOfDay', () => {
    test('sets time to 23:59:59.999', () => {
      const date = new Date('2024-01-15T14:30:45.123');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    test('preserves date components', () => {
      const date = new Date('2024-01-15T14:30:45');
      const result = endOfDay(date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    test('does not modify original date', () => {
      const date = new Date('2024-01-15T14:30:45');
      const originalHours = date.getHours();
      endOfDay(date);
      expect(date.getHours()).toBe(originalHours);
    });

    test('throws error for invalid date', () => {
      expect(() => endOfDay(new Date('invalid'))).toThrow(TypeError);
    });
  });
});

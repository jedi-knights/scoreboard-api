import { DateValidator } from '../../../src/validators/date-validator.js';

describe('DateValidator', () => {
  describe('validateDateFormat', () => {
    it('should pass for valid date format', () => {
      expect(() => DateValidator.validateDateFormat('2024-01-15', 'date')).not.toThrow();
      expect(() => DateValidator.validateDateFormat('2024-12-31', 'date')).not.toThrow();
      expect(() => DateValidator.validateDateFormat('2000-02-29', 'date')).not.toThrow(); // Leap year
      expect(() => DateValidator.validateDateFormat('2023-06-01', 'date')).not.toThrow();
    });

    it('should throw for invalid date format', () => {
      expect(() => DateValidator.validateDateFormat('2024/01/15', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateFormat('01-15-2024', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateFormat('2024-1-15', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateFormat('2024-01-5', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateFormat('2024-13-01', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateFormat('2024-01-32', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateFormat('invalid-date', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateFormat('', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
    });

    it('should throw for non-string values', () => {
      expect(() => DateValidator.validateDateFormat(123, 'date'))
        .toThrow('date must be a string');
      expect(() => DateValidator.validateDateFormat(null, 'date'))
        .toThrow('date must be a string');
      expect(() => DateValidator.validateDateFormat(undefined, 'date'))
        .toThrow('date must be a string');
      expect(() => DateValidator.validateDateFormat(new Date(), 'date'))
        .toThrow('date must be a string');
    });

    it('should use default field name', () => {
      expect(() => DateValidator.validateDateFormat('invalid-date'))
        .toThrow('Date must match the format: YYYY-MM-DD');
    });
  });

  describe('validateDateNotInPast', () => {
    it('should pass for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotInPast(tomorrowStr, 'date')).not.toThrow();
    });

    it('should pass for today', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotInPast(todayStr, 'date')).not.toThrow();
    });

    it('should throw for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotInPast(yesterdayStr, 'date'))
        .toThrow('date cannot be in the past');
      
      expect(() => DateValidator.validateDateNotInPast('2023-01-01', 'date'))
        .toThrow('date cannot be in the past');
      expect(() => DateValidator.validateDateNotInPast('2000-01-01', 'date'))
        .toThrow('date cannot be in the past');
    });

    it('should throw for invalid date format', () => {
      expect(() => DateValidator.validateDateNotInPast('invalid-date', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
    });

    it('should use default field name', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotInPast(yesterdayStr))
        .toThrow('Date cannot be in the past');
    });
  });

  describe('validateDateNotTooFarInFuture', () => {
    it('should pass for dates within range', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotTooFarInFuture(tomorrowStr, 'date')).not.toThrow();
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotTooFarInFuture(nextMonthStr, 'date')).not.toThrow();
    });

    it('should pass for dates at the limit', () => {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 365);
      const maxDateStr = maxDate.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotTooFarInFuture(maxDateStr, 'date')).not.toThrow();
    });

    it('should throw for dates too far in future', () => {
      const tooFarDate = new Date();
      tooFarDate.setDate(tooFarDate.getDate() + 366);
      const tooFarDateStr = tooFarDate.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotTooFarInFuture(tooFarDateStr, 'date'))
        .toThrow('date cannot be more than 365 days in the future');
      
      expect(() => DateValidator.validateDateNotTooFarInFuture('2030-01-01', 'date'))
        .toThrow('date cannot be more than 365 days in the future');
    });

    it('should accept custom max days', () => {
      const customMaxDate = new Date();
      customMaxDate.setDate(customMaxDate.getDate() + 30);
      const customMaxDateStr = customMaxDate.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotTooFarInFuture(customMaxDateStr, 'date', 30)).not.toThrow();
      
      const tooFarCustomDate = new Date();
      tooFarCustomDate.setDate(tooFarCustomDate.getDate() + 31);
      const tooFarCustomDateStr = tooFarCustomDate.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotTooFarInFuture(tooFarCustomDateStr, 'date', 30))
        .toThrow('date cannot be more than 30 days in the future');
    });

    it('should throw for invalid date format', () => {
      expect(() => DateValidator.validateDateNotTooFarInFuture('invalid-date', 'date'))
        .toThrow('date must match the format: YYYY-MM-DD');
    });

    it('should use default field name', () => {
      const tooFarDate = new Date();
      tooFarDate.setDate(tooFarDate.getDate() + 366);
      const tooFarDateStr = tooFarDate.toISOString().split('T')[0];
      
      expect(() => DateValidator.validateDateNotTooFarInFuture(tooFarDateStr))
        .toThrow('Date cannot be more than 365 days in the future');
    });
  });

  describe('validateDateRange', () => {
    it('should pass for valid date ranges', () => {
      expect(() => DateValidator.validateDateRange('2024-01-01', '2024-01-31', 'startDate', 'endDate')).not.toThrow();
      expect(() => DateValidator.validateDateRange('2024-01-01', '2024-12-31', 'startDate', 'endDate')).not.toThrow();
      expect(() => DateValidator.validateDateRange('2024-01-01', '2024-01-01', 'startDate', 'endDate')).not.toThrow(); // Same date
    });

    it('should throw for invalid date ranges', () => {
      expect(() => DateValidator.validateDateRange('2024-01-31', '2024-01-01', 'startDate', 'endDate'))
        .toThrow('startDate must be before or equal to endDate');
      expect(() => DateValidator.validateDateRange('2024-12-31', '2024-01-01', 'startDate', 'endDate'))
        .toThrow('startDate must be before or equal to endDate');
    });

    it('should throw for invalid date format', () => {
      expect(() => DateValidator.validateDateRange('invalid-date', '2024-01-31', 'startDate', 'endDate'))
        .toThrow('startDate must match the format: YYYY-MM-DD');
      expect(() => DateValidator.validateDateRange('2024-01-01', 'invalid-date', 'startDate', 'endDate'))
        .toThrow('endDate must match the format: YYYY-MM-DD');
    });

    it('should use default field names', () => {
      expect(() => DateValidator.validateDateRange('2024-01-31', '2024-01-01'))
        .toThrow('Start date must be before or equal to End date');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(DateValidator.isValidDate('2024-01-15')).toBe(true);
      expect(DateValidator.isValidDate('2024-12-31')).toBe(true);
      expect(DateValidator.isValidDate('2000-02-29')).toBe(true); // Leap year
      expect(DateValidator.isValidDate('2023-06-01')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(DateValidator.isValidDate('2024-13-01')).toBe(false); // Invalid month
      expect(DateValidator.isValidDate('2024-01-32')).toBe(false); // Invalid day
      expect(DateValidator.isValidDate('2024-02-30')).toBe(false); // Invalid day for February
      expect(DateValidator.isValidDate('2023-02-29')).toBe(false); // Invalid day for non-leap year
      expect(DateValidator.isValidDate('invalid-date')).toBe(false);
      expect(DateValidator.isValidDate('')).toBe(false);
      expect(DateValidator.isValidDate(null)).toBe(false);
      expect(DateValidator.isValidDate(undefined)).toBe(false);
      expect(DateValidator.isValidDate(123)).toBe(false);
    });
  });

  describe('isValidDateFormat', () => {
    it('should return true for valid date format', () => {
      expect(DateValidator.isValidDateFormat('2024-01-15')).toBe(true);
      expect(DateValidator.isValidDateFormat('2024-12-31')).toBe(true);
      expect(DateValidator.isValidDateFormat('2000-02-29')).toBe(true);
      expect(DateValidator.isValidDateFormat('2023-06-01')).toBe(true);
    });

    it('should return false for invalid date format', () => {
      expect(DateValidator.isValidDateFormat('2024/01/15')).toBe(false);
      expect(DateValidator.isValidDateFormat('01-15-2024')).toBe(false);
      expect(DateValidator.isValidDateFormat('2024-1-15')).toBe(false);
      expect(DateValidator.isValidDateFormat('2024-01-5')).toBe(false);
      expect(DateValidator.isValidDateFormat('invalid-date')).toBe(false);
      expect(DateValidator.isValidDateFormat('')).toBe(false);
      expect(DateValidator.isValidDateFormat(null)).toBe(false);
      expect(DateValidator.isValidDateFormat(undefined)).toBe(false);
      expect(DateValidator.isValidDateFormat(123)).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return date format regex', () => {
      const regex = DateValidator.getDateFormatRegex();
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.test('2024-01-15')).toBe(true);
      expect(regex.test('2024/01/15')).toBe(false);
      expect(regex.test('01-15-2024')).toBe(false);
    });

    it('should return date format description', () => {
      const description = DateValidator.getDateFormatDescription();
      expect(description).toBe('YYYY-MM-DD');
    });
  });
});

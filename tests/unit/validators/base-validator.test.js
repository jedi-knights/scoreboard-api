import { BaseValidator } from '../../../src/validators/base-validator.js';

describe('BaseValidator', () => {
  describe('isRequired', () => {
    it('should pass for truthy values', () => {
      expect(() => BaseValidator.isRequired('value', 'field')).not.toThrow();
      expect(() => BaseValidator.isRequired(123, 'field')).not.toThrow();
      expect(() => BaseValidator.isRequired(true, 'field')).not.toThrow();
      expect(() => BaseValidator.isRequired({}, 'field')).not.toThrow();
      expect(() => BaseValidator.isRequired([], 'field')).not.toThrow();
    });

    it('should throw for falsy values', () => {
      expect(() => BaseValidator.isRequired('', 'field')).toThrow('field is required');
      expect(() => BaseValidator.isRequired(null, 'field')).toThrow('field is required');
      expect(() => BaseValidator.isRequired(undefined, 'field')).toThrow('field is required');
      expect(() => BaseValidator.isRequired(0, 'field')).toThrow('field is required');
      expect(() => BaseValidator.isRequired(false, 'field')).toThrow('field is required');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isRequired('')).toThrow('Value is required');
    });
  });

  describe('isString', () => {
    it('should pass for strings', () => {
      expect(() => BaseValidator.isString('value', 'field')).not.toThrow();
      expect(() => BaseValidator.isString('', 'field')).not.toThrow();
    });

    it('should throw for non-strings', () => {
      expect(() => BaseValidator.isString(123, 'field')).toThrow('field must be a string');
      expect(() => BaseValidator.isString(true, 'field')).toThrow('field must be a string');
      expect(() => BaseValidator.isString({}, 'field')).toThrow('field must be a string');
      expect(() => BaseValidator.isString([], 'field')).toThrow('field must be a string');
      expect(() => BaseValidator.isString(null, 'field')).toThrow('field must be a string');
      expect(() => BaseValidator.isString(undefined, 'field')).toThrow('field must be a string');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isString(123)).toThrow('Value must be a string');
    });
  });

  describe('isNonEmptyString', () => {
    it('should pass for non-empty strings', () => {
      expect(() => BaseValidator.isNonEmptyString('value', 'field')).not.toThrow();
      expect(() => BaseValidator.isNonEmptyString('  value  ', 'field')).not.toThrow();
    });

    it('should throw for empty or whitespace strings', () => {
      expect(() => BaseValidator.isNonEmptyString('', 'field')).toThrow('field must be a non-empty string');
      expect(() => BaseValidator.isNonEmptyString('   ', 'field')).toThrow('field must be a non-empty string');
      expect(() => BaseValidator.isNonEmptyString('\t\n', 'field')).toThrow('field must be a non-empty string');
    });

    it('should throw for non-strings', () => {
      expect(() => BaseValidator.isNonEmptyString(123, 'field')).toThrow('field must be a non-empty string');
      expect(() => BaseValidator.isNonEmptyString(null, 'field')).toThrow('field must be a non-empty string');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isNonEmptyString('')).toThrow('Value must be a non-empty string');
    });
  });

  describe('isNumber', () => {
    it('should pass for numbers', () => {
      expect(() => BaseValidator.isNumber(123, 'field')).not.toThrow();
      expect(() => BaseValidator.isNumber(0, 'field')).not.toThrow();
      expect(() => BaseValidator.isNumber(-123, 'field')).not.toThrow();
      expect(() => BaseValidator.isNumber(3.14, 'field')).not.toThrow();
    });

    it('should throw for non-numbers', () => {
      expect(() => BaseValidator.isNumber('123', 'field')).toThrow('field must be a number');
      expect(() => BaseValidator.isNumber(true, 'field')).toThrow('field must be a number');
      expect(() => BaseValidator.isNumber({}, 'field')).toThrow('field must be a number');
      expect(() => BaseValidator.isNumber([], 'field')).toThrow('field must be a number');
      expect(() => BaseValidator.isNumber(null, 'field')).toThrow('field must be a number');
      expect(() => BaseValidator.isNumber(undefined, 'field')).toThrow('field must be a number');
      expect(() => BaseValidator.isNumber(NaN, 'field')).toThrow('field must be a number');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isNumber('123')).toThrow('Value must be a number');
    });
  });

  describe('isPositiveNumber', () => {
    it('should pass for positive numbers', () => {
      expect(() => BaseValidator.isPositiveNumber(123, 'field')).not.toThrow();
      expect(() => BaseValidator.isPositiveNumber(0.1, 'field')).not.toThrow();
    });

    it('should throw for non-positive numbers', () => {
      expect(() => BaseValidator.isPositiveNumber(0, 'field')).toThrow('field must be a positive number');
      expect(() => BaseValidator.isPositiveNumber(-123, 'field')).toThrow('field must be a positive number');
      expect(() => BaseValidator.isPositiveNumber(-0.1, 'field')).toThrow('field must be a positive number');
    });

    it('should throw for non-numbers', () => {
      expect(() => BaseValidator.isPositiveNumber('123', 'field')).toThrow('field must be a positive number');
      expect(() => BaseValidator.isPositiveNumber(null, 'field')).toThrow('field must be a positive number');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isPositiveNumber(0)).toThrow('Value must be a positive number');
    });
  });

  describe('isNonNegativeNumber', () => {
    it('should pass for non-negative numbers', () => {
      expect(() => BaseValidator.isNonNegativeNumber(123, 'field')).not.toThrow();
      expect(() => BaseValidator.isNonNegativeNumber(0, 'field')).not.toThrow();
      expect(() => BaseValidator.isNonNegativeNumber(0.1, 'field')).not.toThrow();
    });

    it('should throw for negative numbers', () => {
      expect(() => BaseValidator.isNonNegativeNumber(-123, 'field')).toThrow('field must be a non-negative number');
      expect(() => BaseValidator.isNonNegativeNumber(-0.1, 'field')).toThrow('field must be a non-negative number');
    });

    it('should throw for non-numbers', () => {
      expect(() => BaseValidator.isNonNegativeNumber('123', 'field')).toThrow('field must be a non-negative number');
      expect(() => BaseValidator.isNonNegativeNumber(null, 'field')).toThrow('field must be a non-negative number');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isNonNegativeNumber(-1)).toThrow('Value must be a non-negative number');
    });
  });

  describe('isInRange', () => {
    it('should pass for values within range', () => {
      expect(() => BaseValidator.isInRange(5, 'field', 1, 10)).not.toThrow();
      expect(() => BaseValidator.isInRange(1, 'field', 1, 10)).not.toThrow();
      expect(() => BaseValidator.isInRange(10, 'field', 1, 10)).not.toThrow();
    });

    it('should throw for values outside range', () => {
      expect(() => BaseValidator.isInRange(0, 'field', 1, 10)).toThrow('field must be between 1 and 10');
      expect(() => BaseValidator.isInRange(11, 'field', 1, 10)).toThrow('field must be between 1 and 10');
      expect(() => BaseValidator.isInRange(-5, 'field', 1, 10)).toThrow('field must be between 1 and 10');
    });

    it('should throw for non-numbers', () => {
      expect(() => BaseValidator.isInRange('5', 'field', 1, 10)).toThrow('field must be a number');
      expect(() => BaseValidator.isInRange(null, 'field', 1, 10)).toThrow('field must be a number');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isInRange(0, 'Value', 1, 10)).toThrow('Value must be between 1 and 10');
    });
  });

  describe('isOneOf', () => {
    it('should pass for values in allowed list', () => {
      expect(() => BaseValidator.isOneOf('apple', 'field', ['apple', 'banana', 'cherry'])).not.toThrow();
      expect(() => BaseValidator.isOneOf('banana', 'field', ['apple', 'banana', 'cherry'])).not.toThrow();
      expect(() => BaseValidator.isOneOf('cherry', 'field', ['apple', 'banana', 'cherry'])).not.toThrow();
    });

    it('should throw for values not in allowed list', () => {
      expect(() => BaseValidator.isOneOf('orange', 'field', ['apple', 'banana', 'cherry']))
        .toThrow('field must be one of: apple, banana, cherry');
      expect(() => BaseValidator.isOneOf('', 'field', ['apple', 'banana', 'cherry']))
        .toThrow('field must be one of: apple, banana, cherry');
      expect(() => BaseValidator.isOneOf(null, 'field', ['apple', 'banana', 'cherry']))
        .toThrow('field must be one of: apple, banana, cherry');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.isOneOf('orange', 'Value', ['apple', 'banana']))
        .toThrow('Value must be one of: apple, banana');
    });
  });

  describe('matchesPattern', () => {
    it('should pass for values matching pattern', () => {
      expect(() => BaseValidator.matchesPattern('ABC123', 'field', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .not.toThrow();
      expect(() => BaseValidator.matchesPattern('XYZ789', 'field', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .not.toThrow();
    });

    it('should throw for values not matching pattern', () => {
      expect(() => BaseValidator.matchesPattern('ABC12', 'field', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .toThrow('field must match the format: 3 letters + 3 digits');
      expect(() => BaseValidator.matchesPattern('AB123', 'field', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .toThrow('field must match the format: 3 letters + 3 digits');
      expect(() => BaseValidator.matchesPattern('abc123', 'field', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .toThrow('field must match the format: 3 letters + 3 digits');
    });

    it('should throw for non-strings', () => {
      expect(() => BaseValidator.matchesPattern(123, 'field', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .toThrow('field must be a string');
      expect(() => BaseValidator.matchesPattern(null, 'field', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .toThrow('field must be a string');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.matchesPattern('ABC12', 'Value', /^[A-Z]{3}\d{3}$/, '3 letters + 3 digits'))
        .toThrow('Value must match the format: 3 letters + 3 digits');
    });
  });

  describe('hasMinLength', () => {
    it('should pass for strings with sufficient length', () => {
      expect(() => BaseValidator.hasMinLength('hello', 'field', 3)).not.toThrow();
      expect(() => BaseValidator.hasMinLength('hello', 'field', 5)).not.toThrow();
      expect(() => BaseValidator.hasMinLength('hello world', 'field', 5)).not.toThrow();
    });

    it('should throw for strings that are too short', () => {
      expect(() => BaseValidator.hasMinLength('hi', 'field', 3)).toThrow('field must be at least 3 characters long');
      expect(() => BaseValidator.hasMinLength('', 'field', 1)).toThrow('field must be at least 1 character long');
    });

    it('should throw for non-strings', () => {
      expect(() => BaseValidator.hasMinLength(123, 'field', 3)).toThrow('field must be a string');
      expect(() => BaseValidator.hasMinLength(null, 'field', 3)).toThrow('field must be a string');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.hasMinLength('hi', 'Value', 3)).toThrow('Value must be at least 3 characters long');
    });
  });

  describe('hasMaxLength', () => {
    it('should pass for strings within length limit', () => {
      expect(() => BaseValidator.hasMaxLength('hello', 'field', 10)).not.toThrow();
      expect(() => BaseValidator.hasMaxLength('hello', 'field', 5)).not.toThrow();
      expect(() => BaseValidator.hasMaxLength('hi', 'field', 5)).not.toThrow();
    });

    it('should throw for strings that are too long', () => {
      expect(() => BaseValidator.hasMaxLength('hello world', 'field', 5)).toThrow('field must be no more than 5 characters long');
      expect(() => BaseValidator.hasMaxLength('very long string here', 'field', 10)).toThrow('field must be no more than 10 characters long');
    });

    it('should throw for non-strings', () => {
      expect(() => BaseValidator.hasMaxLength(123, 'field', 5)).toThrow('field must be a string');
      expect(() => BaseValidator.hasMaxLength(null, 'field', 5)).toThrow('field must be a string');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.hasMaxLength('hello world', 'Value', 5)).toThrow('Value must be no more than 5 characters long');
    });
  });

  describe('hasLengthInRange', () => {
    it('should pass for strings within length range', () => {
      expect(() => BaseValidator.hasLengthInRange('hello', 'field', 3, 10)).not.toThrow();
      expect(() => BaseValidator.hasLengthInRange('hello', 'field', 5, 10)).not.toThrow();
      expect(() => BaseValidator.hasLengthInRange('hello world', 'field', 5, 15)).not.toThrow();
    });

    it('should throw for strings outside length range', () => {
      expect(() => BaseValidator.hasLengthInRange('hi', 'field', 3, 10)).toThrow('field must be between 3 and 10 characters long');
      expect(() => BaseValidator.hasLengthInRange('very long string here', 'field', 3, 10)).toThrow('field must be between 3 and 10 characters long');
    });

    it('should throw for non-strings', () => {
      expect(() => BaseValidator.hasLengthInRange(123, 'field', 3, 10)).toThrow('field must be a string');
      expect(() => BaseValidator.hasLengthInRange(null, 'field', 3, 10)).toThrow('field must be a string');
    });

    it('should use default field name', () => {
      expect(() => BaseValidator.hasLengthInRange('hi', 'Value', 3, 10)).toThrow('Value must be between 3 and 10 characters long');
    });
  });
});

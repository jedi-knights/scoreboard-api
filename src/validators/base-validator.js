/**
 * Base Validator Class
 *
 * Provides common validation methods that can be used across different validators.
 * This class serves as a foundation for domain-specific validators.
 */
export class BaseValidator {
  /**
   * Validate that a value is not null, undefined, or empty string
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static isRequired (value, fieldName = 'Value') {
    if (this.isNullOrUndefined(value)) {
      throw new Error(`${fieldName} is required`);
    }
    if (this.isEmptyString(value)) {
      throw new Error(`${fieldName} is required`);
    }
    if (this.isFalseOrZero(value)) {
      throw new Error(`${fieldName} is required`);
    }
    return true;
  }

  /**
   * Check if value is null or undefined
   * @param {*} value - Value to check
   * @returns {boolean} True if null or undefined
   * @private
   */
  static isNullOrUndefined (value) {
    return value === null || value === undefined;
  }

  /**
   * Check if value is an empty string
   * @param {*} value - Value to check
   * @returns {boolean} True if empty string
   * @private
   */
  static isEmptyString (value) {
    return typeof value === 'string' && value.trim().length === 0;
  }

  /**
   * Check if value is false or zero
   * @param {*} value - Value to check
   * @returns {boolean} True if false or zero
   * @private
   */
  static isFalseOrZero (value) {
    return value === false || value === 0;
  }

  /**
   * Validate that a value is a string
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static isString (value, fieldName = 'Value') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} must be a string`);
    }
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    return true;
  }

  /**
   * Validate that a value is a non-empty string
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static isNonEmptyString (value, fieldName = 'Value') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} must be a non-empty string`);
    }
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a non-empty string`);
    }
    if (value.trim().length === 0) {
      throw new Error(`${fieldName} must be a non-empty string`);
    }
    return true;
  }

  /**
   * Validate that a value is a number
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static isNumber (value, fieldName = 'Value') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} must be a number`);
    }
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} must be a number`);
    }
    return true;
  }

  /**
   * Validate that a value is a positive number
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static isPositiveNumber (value, fieldName = 'Value') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} must be a positive number`);
    }
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} must be a positive number`);
    }
    if (value <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }
    return true;
  }

  /**
   * Validate that a value is a non-negative number
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static isNonNegativeNumber (value, fieldName = 'Value') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} must be a non-negative number`);
    }
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} must be a non-negative number`);
    }
    if (value < 0) {
      throw new Error(`${fieldName} must be a non-negative number`);
    }
    return true;
  }

  /**
   * Validate that a value is within a specified range
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {boolean} True if valid
   */
  static isInRange (value, fieldName = 'Value', min, max) {
    this.isNumber(value, fieldName);
    if (value !== undefined && value !== null && (value < min || value > max)) {
      throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }
    return true;
  }

  /**
   * Validate that a value is one of the allowed values
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {Array} allowedValues - Array of allowed values
   * @returns {boolean} True if valid
   */
  static isOneOf (value, fieldName = 'Value', allowedValues) {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
    if (!allowedValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
    return true;
  }

  /**
   * Validate that a value matches a regex pattern
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {RegExp} pattern - Regex pattern to match
   * @param {string} description - Description of the expected format
   * @returns {boolean} True if valid
   */
  static matchesPattern (value, fieldName = 'Value', pattern, description) {
    this.isString(value, fieldName);
    if (value !== undefined && value !== null && !pattern.test(value)) {
      throw new Error(`${fieldName} must match the format: ${description}`);
    }
    return true;
  }

  /**
   * Validate that a value has a minimum length
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {number} minLength - Minimum required length
   * @returns {boolean} True if valid
   */
  static hasMinLength (value, fieldName = 'Value', minLength) {
    this.isString(value, fieldName);
    if (value !== undefined && value !== null && value.length < minLength) {
      throw new Error(`${fieldName} must be at least ${minLength} character${minLength === 1 ? '' : 's'} long`);
    }
    return true;
  }

  /**
   * Validate that a value has a maximum length
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {number} maxLength - Maximum allowed length
   * @returns {boolean} True if valid
   */
  static hasMaxLength (value, fieldName = 'Value', maxLength) {
    this.isString(value, fieldName);
    if (value !== undefined && value !== null && value.length > maxLength) {
      throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
    }
    return true;
  }

  /**
   * Validate that a value has a length within a specified range
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {number} minLength - Minimum required length
   * @param {number} maxLength - Maximum allowed length
   * @returns {boolean} True if valid
   */
  static hasLengthInRange (value, fieldName = 'Value', minLength, maxLength) {
    this.isString(value, fieldName);
    if (value !== undefined && value !== null) {
      if (value.length < minLength || value.length > maxLength) {
        throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters long`);
      }
    }
    return true;
  }
}

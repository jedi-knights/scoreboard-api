

/**
 * Date Validator Class
 *
 * Handles validation for date-related data including format validation and date logic.
 */
export class DateValidator {
  // Date format regex for YYYY-MM-DD
  static DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  // Date format description
  static DATE_FORMAT_DESCRIPTION = 'YYYY-MM-DD';

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} date - Date string to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static validateDateFormat (date, fieldName = 'Date') {
    this.validateDateString(date, fieldName);
    this.validateDateRegex(date, fieldName);
    this.validateDateValidity(date, fieldName);
    return true;
  }

  /**
   * Validate that date is a non-empty string
   * @param {string} date - Date string to validate
   * @param {string} fieldName - Name of the field for error messages
   * @private
   */
  static validateDateString (date, fieldName) {
    if (date === null || date === undefined) {
      throw new Error(`${fieldName} must be a string`);
    }
    if (typeof date !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    if (date.trim().length === 0) {
      throw new Error(`${fieldName} must match the format: ${this.DATE_FORMAT_DESCRIPTION}`);
    }
  }

  /**
   * Validate date format using regex
   * @param {string} date - Date string to validate
   * @param {string} fieldName - Name of the field for error messages
   * @private
   */
  static validateDateRegex (date, fieldName) {
    if (!this.DATE_FORMAT_REGEX.test(date)) {
      throw new Error(`${fieldName} must match the format: ${this.DATE_FORMAT_DESCRIPTION}`);
    }
  }

  /**
   * Validate date validity using isValidDate method
   * @param {string} date - Date string to validate
   * @param {string} fieldName - Name of the field for error messages
   * @private
   */
  static validateDateValidity (date, fieldName) {
    if (!this.isValidDate(date)) {
      throw new Error(`${fieldName} must match the format: ${this.DATE_FORMAT_DESCRIPTION}`);
    }
  }

  /**
   * Validate that a date is not in the past
   * @param {string} date - Date string to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static validateDateNotInPast (date, fieldName = 'Date') {
    this.validateDateFormat(date, fieldName);

    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Allow today (same day) - compare dates as strings to avoid timezone issues
    const dateStr = dateObj.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    if (dateStr < todayStr) {
      throw new Error(`${fieldName} cannot be in the past`);
    }

    return true;
  }

  /**
   * Validate that a date is not in the future beyond a certain limit
   * @param {string} date - Date string to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {number} maxDaysInFuture - Maximum days in the future allowed
   * @returns {boolean} True if valid
   */
  static validateDateNotTooFarInFuture (date, fieldName = 'Date', maxDaysInFuture = 365) {
    this.validateDateFormat(date, fieldName);

    const dateObj = new Date(date);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setDate(today.getDate() + maxDaysInFuture);

    if (dateObj > maxFutureDate) {
      throw new Error(`${fieldName} cannot be more than ${maxDaysInFuture} days in the future`);
    }

    return true;
  }

  /**
   * Validate date range (start date must be before or equal to end date)
   * @param {string} startDate - Start date string
   * @param {string} endDate - End date string
   * @param {string} startDateFieldName - Name of the start date field
   * @param {string} endDateFieldName - Name of the end date field
   * @returns {boolean} True if valid
   */
  static validateDateRange (startDate, endDate, startDateFieldName = 'Start date', endDateFieldName = 'End date') {
    this.validateDateFormat(startDate, startDateFieldName);
    this.validateDateFormat(endDate, endDateFieldName);

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Allow same dates (start <= end) as tests expect
    if (startDateObj > endDateObj) {
      throw new Error(`${startDateFieldName} must be before or equal to ${endDateFieldName}`);
    }

    return true;
  }

  /**
   * Check if a date string is valid (returns boolean instead of throwing)
   * @param {string} date - Date string to check
   * @returns {boolean} True if valid
   */
  static isValidDate (date) {
    if (!this.hasValidDateInput(date)) {
      return false;
    }

    if (!this.DATE_FORMAT_REGEX.test(date)) {
      return false;
    }

    if (!this.isValidDateObject(date)) {
      return false;
    }

    return this.matchesInputDate(date);
  }

  /**
   * Check if date input is valid
   * @param {string} date - Date string to check
   * @returns {boolean} True if input is valid
   * @private
   */
  static hasValidDateInput (date) {
    return date && typeof date === 'string';
  }

  /**
   * Check if date object is valid
   * @param {string} date - Date string to check
   * @returns {boolean} True if date object is valid
   * @private
   */
  static isValidDateObject (date) {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  }

  /**
   * Check if parsed date matches input date
   * @param {string} date - Date string to check
   * @returns {boolean} True if dates match
   * @private
   */
  static matchesInputDate (date) {
    const [year, month, day] = date.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day); // month is 0-indexed

    return inputDate.getFullYear() === year &&
           inputDate.getMonth() === month - 1 &&
           inputDate.getDate() === day;
  }

  /**
   * Check if a date format is valid (returns boolean instead of throwing)
   * @param {string} date - Date string to check
   * @returns {boolean} True if format is valid
   */
  static isValidDateFormat (date) {
    if (!date || typeof date !== 'string') {
      return false;
    }
    return this.DATE_FORMAT_REGEX.test(date);
  }

  /**
   * Get the expected date format
   * @returns {string} Expected date format
   */
  static getExpectedFormat () {
    return this.DATE_FORMAT_DESCRIPTION;
  }

  /**
   * Get the date format description (alias for getExpectedFormat)
   * @returns {string} Expected date format
   */
  static getDateFormatDescription () {
    return this.DATE_FORMAT_DESCRIPTION;
  }

  /**
   * Get the date format regex
   * @returns {RegExp} Date format regex
   */
  static getDateFormatRegex () {
    return this.DATE_FORMAT_REGEX;
  }
}

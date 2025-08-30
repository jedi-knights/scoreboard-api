

/**
 * Sports Validator Class
 *
 * Handles validation for sports-related data including sports, divisions, and genders.
 * This validator centralizes all sports domain validation logic.
 */
export class SportsValidator {
  // Valid sports list
  static VALID_SPORTS = [
    'soccer', 'football', 'basketball', 'baseball', 'softball',
    'volleyball', 'tennis', 'golf', 'swimming', 'track',
    'cross-country', 'lacrosse', 'field-hockey', 'ice-hockey',
    'wrestling', 'gymnastics', 'rowing', 'sailing'
  ];

  // Valid divisions list
  static VALID_DIVISIONS = ['d1', 'd2', 'd3', 'naia', 'njcaa'];

  // Valid genders list
  static VALID_GENDERS = ['men', 'women', 'coed'];

  /**
   * Validate sport value
   * @param {string} sport - Sport to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static validateSport (sport, fieldName = 'Sport') {
    // Check for null/undefined first
    if (sport === null || sport === undefined) {
      throw new Error(`${fieldName} must be a string`);
    }

    // Check for non-string values
    if (typeof sport !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    // Check for empty string
    if (sport.trim().length === 0) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_SPORTS.join(', ')}`);
    }

    // Check if sport is in valid list
    if (!this.VALID_SPORTS.includes(sport.toLowerCase())) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_SPORTS.join(', ')}`);
    }

    return true;
  }

  /**
   * Validate division value
   * @param {string} division - Division to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static validateDivision (division, fieldName = 'Division') {
    // Check for null/undefined first
    if (division === null || division === undefined) {
      throw new Error(`${fieldName} must be a string`);
    }

    // Check for non-string values
    if (typeof division !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    // Check for empty string
    if (division.trim().length === 0) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_DIVISIONS.join(', ')}`);
    }

    // Check if division is in valid list
    if (!this.VALID_DIVISIONS.includes(division.toLowerCase())) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_DIVISIONS.join(', ')}`);
    }

    return true;
  }

  /**
   * Validate gender value
   * @param {string} gender - Gender to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} True if valid
   */
  static validateGender (gender, fieldName = 'Gender') {
    // Check for null/undefined first
    if (gender === null || gender === undefined) {
      throw new Error(`${fieldName} must be a string`);
    }

    // Check for non-string values
    if (typeof gender !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    // Check for empty string
    if (gender.trim().length === 0) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_GENDERS.join(', ')}`);
    }

    // Check if gender is in valid list
    if (!this.VALID_GENDERS.includes(gender.toLowerCase())) {
      throw new Error(`${fieldName} must be one of: ${this.VALID_GENDERS.join(', ')}`);
    }

    return true;
  }

  /**
   * Check if a sport is valid (returns boolean instead of throwing)
   * @param {string} sport - Sport to check
   * @returns {boolean} True if valid
   */
  static isValidSport (sport) {
    if (!sport || typeof sport !== 'string') {
      return false;
    }
    return this.VALID_SPORTS.includes(sport.toLowerCase());
  }

  /**
   * Check if a division is valid (returns boolean instead of throwing)
   * @param {string} division - Division to check
   * @returns {boolean} True if valid
   */
  static isValidDivision (division) {
    if (!division || typeof division !== 'string') {
      return false;
    }
    return this.VALID_DIVISIONS.includes(division.toLowerCase());
  }

  /**
   * Check if a gender is valid (returns boolean instead of throwing)
   * @param {string} gender - Gender to check
   * @returns {boolean} True if valid
   */
  static isValidGender (gender) {
    if (!gender || typeof gender !== 'string') {
      return false;
    }
    return this.VALID_GENDERS.includes(gender.toLowerCase());
  }

  /**
   * Get all valid sports
   * @returns {Array<string>} Array of valid sports
   */
  static getValidSports () {
    return [...this.VALID_SPORTS];
  }

  /**
   * Get all valid divisions
   * @returns {Array<string>} Array of valid divisions
   */
  static getValidDivisions () {
    return [...this.VALID_DIVISIONS];
  }

  /**
   * Get all valid genders
   * @returns {Array<string>} Array of valid genders
   */
  static getValidGenders () {
    return [...this.VALID_GENDERS];
  }
}

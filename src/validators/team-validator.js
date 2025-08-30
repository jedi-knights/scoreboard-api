/* global URL */
import { BaseValidator } from './base-validator.js';
import { SportsValidator } from './sports-validator.js';
import { businessConfig } from '../config/index.js';

/**
 * Team Validator Class
 *
 * Handles validation for team-related data including team creation and updates.
 */
export class TeamValidator {
  // Maximum lengths for team fields
  static MAX_LENGTHS = {
    name: businessConfig.games.validation.teamName.maxLength,
    short_name: 20,
    mascot: 50,
    city: 50,
    state: 50,
    country: 50,
    conference: businessConfig.games.validation.conference.maxLength,
    website: 255,
    logo_url: 500,
    colors: businessConfig.games.validation.colors.maxLength
  };

  /**
   * Validate team data
   * @param {Object} teamData - Team data to validate
   * @returns {boolean} True if valid
   */
  static validateTeamData (teamData) {
    if (!teamData) {
      throw new Error('Team data is required');
    }

    // Required fields
    this.validateRequiredFields(teamData);

    // Optional fields
    this.validateOptionalFields(teamData);

    return true;
  }

  /**
   * Validate team update data
   * @param {Object} updateData - Update data to validate
   * @returns {boolean} True if valid
   */
  static validateTeamUpdateData (updateData) {
    if (!updateData) {
      throw new Error('Update data is required');
    }

    this.validateCoreTeamFields(updateData);
    this.validateOptionalFields(updateData);

    return true;
  }

  /**
   * Validate core team fields
   * @param {Object} updateData - Update data to validate
   * @private
   */
  static validateCoreTeamFields (updateData) {
    if (updateData.name !== undefined) {
      this.validateName(updateData.name);
    }

    if (updateData.sport !== undefined) {
      SportsValidator.validateSport(updateData.sport, 'Sport');
    }

    if (updateData.division !== undefined) {
      SportsValidator.validateDivision(updateData.division, 'Division');
    }

    if (updateData.gender !== undefined) {
      SportsValidator.validateGender(updateData.gender, 'Gender');
    }
  }

  /**
   * Validate required team fields
   * @param {Object} teamData - Team data to validate
   * @private
   */
  static validateRequiredFields (teamData) {
    this.validateName(teamData.name);

    if (!teamData.sport) {
      throw new Error('Sport is required');
    }
    SportsValidator.validateSport(teamData.sport, 'Sport');

    if (!teamData.division) {
      throw new Error('Division is required');
    }
    SportsValidator.validateDivision(teamData.division, 'Division');

    if (!teamData.gender) {
      throw new Error('Gender is required');
    }
    SportsValidator.validateGender(teamData.gender, 'Gender');
  }

  /**
   * Validate optional team fields
   * @param {Object} teamData - Team data to validate
   * @private
   */
  static validateOptionalFields (teamData) {
    const optionalValidators = [
      { field: 'short_name', validator: this.validateShortName.bind(this) },
      { field: 'mascot', validator: this.validateMascot.bind(this) },
      { field: 'city', validator: this.validateCity.bind(this) },
      { field: 'state', validator: this.validateState.bind(this) },
      { field: 'country', validator: this.validateCountry.bind(this) },
      { field: 'conference', validator: this.validateConference.bind(this) },
      { field: 'website', validator: this.validateWebsite.bind(this) },
      { field: 'logo_url', validator: this.validateLogoUrl.bind(this) },
      { field: 'colors', validator: this.validateColors.bind(this) }
    ];

    optionalValidators.forEach(({ field, validator }) => {
      if (teamData[field] !== undefined) {
        validator(teamData[field]);
      }
    });
  }

  /**
   * Validate team name
   * @param {string} name - Team name to validate
   * @returns {boolean} True if valid
   */
  static validateName (name) {
    BaseValidator.isRequired(name, 'Team name');
    BaseValidator.isString(name, 'Team name');
    BaseValidator.hasMaxLength(name, 'Team name', this.MAX_LENGTHS.name);

    if (name.trim().length === 0) {
      throw new Error('Team name cannot be empty');
    }

    return true;
  }

  /**
   * Validate team short name
   * @param {string} shortName - Short name to validate
   * @returns {boolean} True if valid
   */
  static validateShortName (shortName) {
    if (shortName === undefined || shortName === null) {
      return true; // Optional field
    }
    BaseValidator.isString(shortName, 'Short name');
    BaseValidator.hasMaxLength(shortName, 'Short name', this.MAX_LENGTHS.short_name);
    return true;
  }

  /**
   * Validate team mascot
   * @param {string} mascot - Mascot to validate
   * @returns {boolean} True if valid
   */
  static validateMascot (mascot) {
    BaseValidator.isString(mascot, 'Mascot');
    if (mascot !== undefined && mascot !== null) {
      BaseValidator.hasMaxLength(mascot, 'Mascot', this.MAX_LENGTHS.mascot);
    }
    return true;
  }

  /**
   * Validate team city
   * @param {string} city - City to validate
   * @returns {boolean} True if valid
   */
  static validateCity (city) {
    BaseValidator.isString(city, 'City');
    if (city !== undefined && city !== null) {
      BaseValidator.hasMaxLength(city, 'City', this.MAX_LENGTHS.city);
    }
    return true;
  }

  /**
   * Validate team state
   * @param {string} state - State to validate
   * @returns {boolean} True if valid
   */
  static validateState (state) {
    BaseValidator.isString(state, 'State');
    if (state !== undefined && state !== null) {
      BaseValidator.hasMaxLength(state, 'State', this.MAX_LENGTHS.state);
    }
    return true;
  }

  /**
   * Validate team country
   * @param {string} country - Country to validate
   * @returns {boolean} True if valid
   */
  static validateCountry (country) {
    BaseValidator.isString(country, 'Country');
    if (country !== undefined && country !== null) {
      BaseValidator.hasMaxLength(country, 'Country', this.MAX_LENGTHS.country);
    }
    return true;
  }

  /**
   * Validate team conference
   * @param {string} conference - Conference to validate
   * @returns {boolean} True if valid
   */
  static validateConference (conference) {
    BaseValidator.isString(conference, 'Conference');
    if (conference !== undefined && conference !== null) {
      BaseValidator.hasMaxLength(conference, 'Conference', this.MAX_LENGTHS.conference);
    }
    return true;
  }

  /**
   * Validate team website
   * @param {string} website - Website to validate
   * @returns {boolean} True if valid
   */
  static validateWebsite (website) {
    BaseValidator.isString(website, 'Website');
    if (website !== undefined && website !== null) {
      BaseValidator.hasMaxLength(website, 'Website', this.MAX_LENGTHS.website);
      // Basic URL validation
      if (website.length > 0 && !this.isValidUrl(website)) {
        throw new Error('Website must be a valid URL');
      }
    }
    return true;
  }

  /**
   * Validate team logo URL
   * @param {string} logoUrl - Logo URL to validate
   * @returns {boolean} True if valid
   */
  static validateLogoUrl (logoUrl) {
    BaseValidator.isString(logoUrl, 'Logo URL');
    if (logoUrl !== undefined && logoUrl !== null) {
      BaseValidator.hasMaxLength(logoUrl, 'Logo URL', this.MAX_LENGTHS.logo_url);
      // Basic URL validation
      if (logoUrl.length > 0 && !this.isValidUrl(logoUrl)) {
        throw new Error('Logo URL must be a valid URL');
      }
    }
    return true;
  }

  /**
   * Validate team colors
   * @param {string} colors - Colors to validate
   * @returns {boolean} True if valid
   */
  static validateColors (colors) {
    if (colors === undefined || colors === null) {
      return true; // Optional field
    }
    BaseValidator.isString(colors, 'Colors');
    BaseValidator.hasMaxLength(colors, 'Colors', this.MAX_LENGTHS.colors);
    return true;
  }

  /**
   * Check if a URL is valid (basic validation)
   * @param {string} url - URL to check
   * @returns {boolean} True if valid
   * @private
   */
  static isValidUrl (url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get maximum lengths for team fields
   * @returns {Object} Object containing max lengths
   */
  static getMaxLengths () {
    return { ...this.MAX_LENGTHS };
  }
}

import { ConferenceValidator } from '../../../src/validators/conference-validator.js';

describe('ConferenceValidator', () => {
  describe('validateConferenceData', () => {
    const validConferenceData = {
      name: 'Test Conference',
      short_name: 'TC',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      level: 'college',
      region: 'East',
      website: 'https://testconference.com',
      logo_url: 'https://testconference.com/logo.png',
      colors: 'Blue, White'
    };

    it('should pass for valid conference data', () => {
      expect(() => ConferenceValidator.validateConferenceData(validConferenceData)).not.toThrow();
    });

    it('should pass for minimal valid conference data', () => {
      const minimalData = {
        name: 'Test Conference',
        sport: 'basketball',
        division: 'd1',
        gender: 'men'
      };
      expect(() => ConferenceValidator.validateConferenceData(minimalData)).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const missingName = { ...validConferenceData };
      delete missingName.name;
      expect(() => ConferenceValidator.validateConferenceData(missingName))
        .toThrow('Conference name is required');

      const missingSport = { ...validConferenceData };
      delete missingSport.sport;
      expect(() => ConferenceValidator.validateConferenceData(missingSport))
        .toThrow('Sport is required');

      const missingDivision = { ...validConferenceData };
      delete missingDivision.division;
      expect(() => ConferenceValidator.validateConferenceData(missingDivision))
        .toThrow('Division is required');

      const missingGender = { ...validConferenceData };
      delete missingGender.gender;
      expect(() => ConferenceValidator.validateConferenceData(missingGender))
        .toThrow('Gender is required');
    });

    it('should throw for invalid sport', () => {
      const invalidSport = { ...validConferenceData, sport: 'invalid-sport' };
      expect(() => ConferenceValidator.validateConferenceData(invalidSport))
        .toThrow('Sport must be one of:');
    });

    it('should throw for invalid division', () => {
      const invalidDivision = { ...validConferenceData, division: 'd4' };
      expect(() => ConferenceValidator.validateConferenceData(invalidDivision))
        .toThrow('Division must be one of:');
    });

    it('should throw for invalid level', () => {
      const invalidLevel = { ...validConferenceData, level: 'invalid-level' };
      expect(() => ConferenceValidator.validateConferenceData(invalidLevel))
        .toThrow('Level must be one of:');
    });

    it('should throw for invalid name length', () => {
      const tooLongName = { ...validConferenceData, name: 'A'.repeat(101) };
      expect(() => ConferenceValidator.validateConferenceData(tooLongName))
        .toThrow('Conference name must be no more than 100 characters long');

      const emptyName = { ...validConferenceData, name: '' };
      expect(() => ConferenceValidator.validateConferenceData(emptyName))
        .toThrow('Conference name cannot be empty');
    });

    it('should throw for invalid short name length', () => {
      const tooLongShortName = { ...validConferenceData, short_name: 'A'.repeat(21) };
      expect(() => ConferenceValidator.validateConferenceData(tooLongShortName))
        .toThrow('Short name must be no more than 20 characters long');
    });

    it('should throw for invalid website URL', () => {
      const invalidWebsite = { ...validConferenceData, website: 'not-a-url' };
      expect(() => ConferenceValidator.validateConferenceData(invalidWebsite))
        .toThrow('Website must be a valid URL');
    });

    it('should throw for invalid logo URL', () => {
      const invalidLogoUrl = { ...validConferenceData, logo_url: 'not-a-url' };
      expect(() => ConferenceValidator.validateConferenceData(invalidLogoUrl))
        .toThrow('Logo URL must be a valid URL');
    });

    it('should throw for non-object input', () => {
      expect(() => ConferenceValidator.validateConferenceData(null))
        .toThrow('Conference data is required');
      expect(() => ConferenceValidator.validateConferenceData(undefined))
        .toThrow('Conference data is required');
      expect(() => ConferenceValidator.validateConferenceData('string'))
        .toThrow('Conference data is required');
    });
  });

  describe('validateConferenceUpdateData', () => {
    const validUpdateData = {
      name: 'Updated Conference',
      short_name: 'UC',
      sport: 'football',
      division: 'd2',
      gender: 'women',
      level: 'university',
      region: 'West',
      website: 'https://updatedconference.com',
      logo_url: 'https://updatedconference.com/logo.png',
      colors: 'Red, Black'
    };

    it('should pass for valid update data', () => {
      expect(() => ConferenceValidator.validateConferenceUpdateData(validUpdateData)).not.toThrow();
    });

    it('should pass for empty update data', () => {
      expect(() => ConferenceValidator.validateConferenceUpdateData({})).not.toThrow();
    });

    it('should throw for non-object input', () => {
      expect(() => ConferenceValidator.validateConferenceUpdateData(null))
        .toThrow('Update data is required');
      expect(() => ConferenceValidator.validateConferenceUpdateData(undefined))
        .toThrow('Update data is required');
      expect(() => ConferenceValidator.validateConferenceUpdateData('string'))
        .toThrow('Update data is required');
    });

    it('should validate individual fields when provided', () => {
      // Test name validation
      expect(() => ConferenceValidator.validateConferenceUpdateData({ name: 'A'.repeat(101) }))
        .toThrow('Conference name must be no more than 100 characters long');

      // Test sport validation
      expect(() => ConferenceValidator.validateConferenceUpdateData({ sport: 'invalid-sport' }))
        .toThrow('Sport must be one of:');

      // Test division validation
      expect(() => ConferenceValidator.validateConferenceUpdateData({ division: 'd4' }))
        .toThrow('Division must be one of:');

      // Test gender validation
      expect(() => ConferenceValidator.validateConferenceUpdateData({ gender: 'invalid-gender' }))
        .toThrow('Gender must be one of:');
    });
  });

  describe('validateName', () => {
    it('should pass for valid names', () => {
      expect(() => ConferenceValidator.validateName('Test Conference')).not.toThrow();
      expect(() => ConferenceValidator.validateName('A'.repeat(100))).not.toThrow();
    });

    it('should throw for invalid names', () => {
      expect(() => ConferenceValidator.validateName('')).toThrow('Conference name cannot be empty');
      expect(() => ConferenceValidator.validateName('   ')).toThrow('Conference name cannot be empty');
      expect(() => ConferenceValidator.validateName('A'.repeat(101))).toThrow('Conference name must be no more than 100 characters long');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateName(null)).toThrow('Conference name is required');
      expect(() => ConferenceValidator.validateName(undefined)).toThrow('Conference name is required');
      expect(() => ConferenceValidator.validateName(123)).toThrow('Conference name must be a string');
    });
  });

  describe('validateShortName', () => {
    it('should pass for valid short names', () => {
      expect(() => ConferenceValidator.validateShortName('TC')).not.toThrow();
      expect(() => ConferenceValidator.validateShortName('A'.repeat(20))).not.toThrow();
      expect(() => ConferenceValidator.validateShortName('')).not.toThrow();
      expect(() => ConferenceValidator.validateShortName(null)).not.toThrow();
      expect(() => ConferenceValidator.validateShortName(undefined)).not.toThrow();
    });

    it('should throw for invalid short names', () => {
      expect(() => ConferenceValidator.validateShortName('A'.repeat(21))).toThrow('Short name must be no more than 20 characters long');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateShortName(123)).toThrow('Short name must be a string');
      expect(() => ConferenceValidator.validateShortName({})).toThrow('Short name must be a string');
    });
  });

  describe('validateLevel', () => {
    it('should pass for valid levels', () => {
      expect(() => ConferenceValidator.validateLevel('college')).not.toThrow();
      expect(() => ConferenceValidator.validateLevel('university')).not.toThrow();
      expect(() => ConferenceValidator.validateLevel('high-school')).not.toThrow();
      expect(() => ConferenceValidator.validateLevel('amateur')).not.toThrow();
      expect(() => ConferenceValidator.validateLevel('professional')).not.toThrow();
    });

    it('should pass for valid levels with different casing', () => {
      expect(() => ConferenceValidator.validateLevel('COLLEGE')).not.toThrow();
      expect(() => ConferenceValidator.validateLevel('University')).not.toThrow();
      expect(() => ConferenceValidator.validateLevel('AMATEUR')).not.toThrow();
    });

    it('should throw for invalid levels', () => {
      expect(() => ConferenceValidator.validateLevel('invalid-level'))
        .toThrow('Level must be one of: college, university, high-school, amateur, professional');
      expect(() => ConferenceValidator.validateLevel('')).toThrow('Level must be one of: college, university, high-school, amateur, professional');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateLevel(123)).toThrow('Level must be a string');
      expect(() => ConferenceValidator.validateLevel(null)).toThrow('Level must be a string');
      expect(() => ConferenceValidator.validateLevel(undefined)).toThrow('Level must be a string');
    });

    it('should use default field name', () => {
      expect(() => ConferenceValidator.validateLevel('invalid-level'))
        .toThrow('Level must be one of: college, university, high-school, amateur, professional');
    });
  });

  describe('validateRegion', () => {
    it('should pass for valid regions', () => {
      expect(() => ConferenceValidator.validateRegion('East')).not.toThrow();
      expect(() => ConferenceValidator.validateRegion('A'.repeat(50))).not.toThrow();
      expect(() => ConferenceValidator.validateRegion('')).not.toThrow();
      expect(() => ConferenceValidator.validateRegion(null)).not.toThrow();
      expect(() => ConferenceValidator.validateRegion(undefined)).not.toThrow();
    });

    it('should throw for invalid regions', () => {
      expect(() => ConferenceValidator.validateRegion('A'.repeat(51))).toThrow('Region must be no more than 50 characters long');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateRegion(123)).toThrow('Region must be a string');
      expect(() => ConferenceValidator.validateRegion({})).toThrow('Region must be a string');
    });
  });

  describe('validateWebsite', () => {
    it('should pass for valid websites', () => {
      expect(() => ConferenceValidator.validateWebsite('https://testconference.com')).not.toThrow();
      expect(() => ConferenceValidator.validateWebsite('http://testconference.com')).not.toThrow();
      expect(() => ConferenceValidator.validateWebsite('')).not.toThrow();
      expect(() => ConferenceValidator.validateWebsite(null)).not.toThrow();
      expect(() => ConferenceValidator.validateWebsite(undefined)).not.toThrow();
    });

    it('should throw for invalid websites', () => {
      expect(() => ConferenceValidator.validateWebsite('not-a-url')).toThrow('Website must be a valid URL');
      expect(() => ConferenceValidator.validateWebsite('ftp://testconference.com')).toThrow('Website must be a valid URL');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateWebsite(123)).toThrow('Website must be a string');
      expect(() => ConferenceValidator.validateWebsite({})).toThrow('Website must be a string');
    });
  });

  describe('validateLogoUrl', () => {
    it('should pass for valid logo URLs', () => {
      expect(() => ConferenceValidator.validateLogoUrl('https://testconference.com/logo.png')).not.toThrow();
      expect(() => ConferenceValidator.validateLogoUrl('http://testconference.com/logo.png')).not.toThrow();
      expect(() => ConferenceValidator.validateLogoUrl('')).not.toThrow();
      expect(() => ConferenceValidator.validateLogoUrl(null)).not.toThrow();
      expect(() => ConferenceValidator.validateLogoUrl(undefined)).not.toThrow();
    });

    it('should throw for invalid logo URLs', () => {
      expect(() => ConferenceValidator.validateLogoUrl('not-a-url')).toThrow('Logo URL must be a valid URL');
      expect(() => ConferenceValidator.validateLogoUrl('ftp://testconference.com/logo.png')).toThrow('Logo URL must be a valid URL');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateLogoUrl(123)).toThrow('Logo URL must be a string');
      expect(() => ConferenceValidator.validateLogoUrl({})).toThrow('Logo URL must be a string');
    });
  });

  describe('validateColors', () => {
    it('should pass for valid colors', () => {
      expect(() => ConferenceValidator.validateColors('Blue, White')).not.toThrow();
      expect(() => ConferenceValidator.validateColors('A'.repeat(100))).not.toThrow();
      expect(() => ConferenceValidator.validateColors('')).not.toThrow();
      expect(() => ConferenceValidator.validateColors(null)).not.toThrow();
      expect(() => ConferenceValidator.validateColors(undefined)).not.toThrow();
    });

    it('should throw for invalid colors', () => {
      expect(() => ConferenceValidator.validateColors('A'.repeat(101))).toThrow('Colors must be no more than 100 characters long');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateColors(123)).toThrow('Colors must be a string');
      expect(() => ConferenceValidator.validateColors({})).toThrow('Colors must be a string');
    });
  });

  describe('validateCountry', () => {
    it('should pass for valid countries', () => {
      expect(() => ConferenceValidator.validateCountry('USA')).not.toThrow();
      expect(() => ConferenceValidator.validateCountry('A'.repeat(50))).not.toThrow();
      expect(() => ConferenceValidator.validateCountry('')).not.toThrow();
      expect(() => ConferenceValidator.validateCountry(null)).not.toThrow();
      expect(() => ConferenceValidator.validateCountry(undefined)).not.toThrow();
    });

    it('should throw for invalid countries', () => {
      expect(() => ConferenceValidator.validateCountry('A'.repeat(51))).toThrow('Country must be no more than 50 characters long');
    });

    it('should throw for non-string values', () => {
      expect(() => ConferenceValidator.validateCountry(123)).toThrow('Country must be a string');
      expect(() => ConferenceValidator.validateCountry({})).toThrow('Country must be a string');
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(ConferenceValidator.isValidUrl('https://testconference.com')).toBe(true);
      expect(ConferenceValidator.isValidUrl('http://testconference.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(ConferenceValidator.isValidUrl('ftp://testconference.com')).toBe(false);
      expect(ConferenceValidator.isValidUrl('not-a-url')).toBe(false);
      expect(ConferenceValidator.isValidUrl('')).toBe(false);
      expect(ConferenceValidator.isValidUrl(null)).toBe(false);
      expect(ConferenceValidator.isValidUrl(undefined)).toBe(false);
    });
  });

  describe('isValidLevel', () => {
    it('should return true for valid levels', () => {
      expect(ConferenceValidator.isValidLevel('college')).toBe(true);
      expect(ConferenceValidator.isValidLevel('university')).toBe(true);
      expect(ConferenceValidator.isValidLevel('amateur')).toBe(true);
      expect(ConferenceValidator.isValidLevel('professional')).toBe(true);
    });

    it('should return true for valid levels with different casing', () => {
      expect(ConferenceValidator.isValidLevel('COLLEGE')).toBe(true);
      expect(ConferenceValidator.isValidLevel('University')).toBe(true);
      expect(ConferenceValidator.isValidLevel('AMATEUR')).toBe(true);
    });

    it('should return false for invalid levels', () => {
      expect(ConferenceValidator.isValidLevel('invalid-level')).toBe(false);
      expect(ConferenceValidator.isValidLevel('')).toBe(false);
      expect(ConferenceValidator.isValidLevel(null)).toBe(false);
      expect(ConferenceValidator.isValidLevel(undefined)).toBe(false);
      expect(ConferenceValidator.isValidLevel(123)).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return max lengths', () => {
      const maxLengths = ConferenceValidator.getMaxLengths();
      expect(maxLengths).toEqual({
        name: 100,
        short_name: 20,
        level: 50,
        website: 255,
        logo_url: 500,
        colors: 100,
        region: 50,
        country: 50
      });
    });

    it('should return valid levels', () => {
      const validLevels = ConferenceValidator.getValidLevels();
      expect(Array.isArray(validLevels)).toBe(true);
      expect(validLevels).toContain('college');
      expect(validLevels).toContain('university');
      expect(validLevels).toContain('high-school');
      expect(validLevels).toContain('amateur');
      expect(validLevels).toContain('professional');
    });
  });
});

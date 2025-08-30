import { TeamValidator } from '../../../src/validators/team-validator.js';

describe('TeamValidator', () => {
  describe('validateTeamData', () => {
    const validTeamData = {
      name: 'Test Team',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      short_name: 'TT',
      conference: 'Test Conference',
      mascot: 'Test Mascot',
      colors: 'Red, Blue',
      website: 'https://testteam.com',
      logo_url: 'https://testteam.com/logo.png',
      city: 'Test City',
      state: 'Test State',
      country: 'USA'
    };

    it('should pass for valid team data', () => {
      expect(() => TeamValidator.validateTeamData(validTeamData)).not.toThrow();
    });

    it('should pass for minimal valid team data', () => {
      const minimalData = {
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men'
      };
      expect(() => TeamValidator.validateTeamData(minimalData)).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const missingName = { ...validTeamData };
      delete missingName.name;
      expect(() => TeamValidator.validateTeamData(missingName))
        .toThrow('Team name is required');

      const missingSport = { ...validTeamData };
      delete missingSport.sport;
      expect(() => TeamValidator.validateTeamData(missingSport))
        .toThrow('Sport is required');

      const missingDivision = { ...validTeamData };
      delete missingDivision.division;
      expect(() => TeamValidator.validateTeamData(missingDivision))
        .toThrow('Division is required');
    });

    it('should throw for invalid sport', () => {
      const invalidSport = { ...validTeamData, sport: 'invalid-sport' };
      expect(() => TeamValidator.validateTeamData(invalidSport))
        .toThrow('Sport must be one of:');
    });

    it('should throw for invalid division', () => {
      const invalidDivision = { ...validTeamData, division: 'd4' };
      expect(() => TeamValidator.validateTeamData(invalidDivision))
        .toThrow('Division must be one of:');
    });

    it('should throw for invalid gender', () => {
      const invalidGender = { ...validTeamData, gender: 'invalid-gender' };
      expect(() => TeamValidator.validateTeamData(invalidGender))
        .toThrow('Gender must be one of:');
    });

    it('should throw for invalid name length', () => {
      const tooLongName = { ...validTeamData, name: 'A'.repeat(101) };
      expect(() => TeamValidator.validateTeamData(tooLongName))
        .toThrow('Team name must be no more than 100 characters long');

      const emptyName = { ...validTeamData, name: '' };
      expect(() => TeamValidator.validateTeamData(emptyName))
        .toThrow('Team name is required');
    });

    it('should throw for invalid short name length', () => {
      const tooLongShortName = { ...validTeamData, short_name: 'A'.repeat(21) };
      expect(() => TeamValidator.validateTeamData(tooLongShortName))
        .toThrow('Short name must be no more than 20 characters long');
    });

    it('should throw for invalid website URL', () => {
      const invalidWebsite = { ...validTeamData, website: 'not-a-url' };
      expect(() => TeamValidator.validateTeamData(invalidWebsite))
        .toThrow('Website must be a valid URL');
    });

    it('should throw for invalid logo URL', () => {
      const invalidLogoUrl = { ...validTeamData, logo_url: 'not-a-url' };
      expect(() => TeamValidator.validateTeamData(invalidLogoUrl))
        .toThrow('Logo URL must be a valid URL');
    });



    it('should throw for non-object input', () => {
      expect(() => TeamValidator.validateTeamData(null))
        .toThrow('Team data is required');
      expect(() => TeamValidator.validateTeamData(undefined))
        .toThrow('Team data is required');
    });
  });

  describe('validateTeamUpdateData', () => {
    const validUpdateData = {
      name: 'Updated Team Name',
      short_name: 'UT',
      status: 'active'
    };

    it('should pass for valid update data', () => {
      expect(() => TeamValidator.validateTeamUpdateData(validUpdateData)).not.toThrow();
    });

    it('should pass for empty update data', () => {
      expect(() => TeamValidator.validateTeamUpdateData({})).not.toThrow();
    });



    it('should throw for invalid sport in update data', () => {
      const invalidSport = { ...validUpdateData, sport: 'invalid-sport' };
      expect(() => TeamValidator.validateTeamUpdateData(invalidSport))
        .toThrow('Sport must be one of:');
    });

    it('should throw for invalid division in update data', () => {
      const invalidDivision = { ...validUpdateData, division: 'd4' };
      expect(() => TeamValidator.validateTeamUpdateData(invalidDivision))
        .toThrow('Division must be one of:');
    });

    it('should throw for invalid gender in update data', () => {
      const invalidGender = { ...validUpdateData, gender: 'invalid-gender' };
      expect(() => TeamValidator.validateTeamUpdateData(invalidGender))
        .toThrow('Gender must be one of:');
    });

    it('should throw for invalid website URL in update data', () => {
      const invalidWebsite = { ...validUpdateData, website: 'not-a-url' };
      expect(() => TeamValidator.validateTeamUpdateData(invalidWebsite))
        .toThrow('Website must be a valid URL');
    });

    it('should throw for invalid logo URL in update data', () => {
      const invalidLogoUrl = { ...validUpdateData, logo_url: 'not-a-url' };
      expect(() => TeamValidator.validateTeamUpdateData(invalidLogoUrl))
        .toThrow('Logo URL must be a valid URL');
    });

    it('should throw for non-object input', () => {
      expect(() => TeamValidator.validateTeamUpdateData(null))
        .toThrow('Update data is required');
      expect(() => TeamValidator.validateTeamUpdateData(undefined))
        .toThrow('Update data is required');
    });
  });

  describe('validateRequiredFields', () => {
    it('should pass for valid required fields', () => {
      const validData = {
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men'
      };
      expect(() => TeamValidator.validateRequiredFields(validData)).not.toThrow();
    });

    it('should throw for missing name', () => {
      const missingName = {
        sport: 'basketball',
        division: 'd1'
      };
      expect(() => TeamValidator.validateRequiredFields(missingName))
        .toThrow('Team name is required');
    });

    it('should throw for missing sport', () => {
      const missingSport = {
        name: 'Test Team',
        division: 'd1'
      };
      expect(() => TeamValidator.validateRequiredFields(missingSport))
        .toThrow('Sport is required');
    });

    it('should throw for missing division', () => {
      const missingDivision = {
        name: 'Test Team',
        sport: 'basketball'
      };
      expect(() => TeamValidator.validateRequiredFields(missingDivision))
        .toThrow('Division is required');
    });
  });

  describe('validateOptionalFields', () => {
    it('should pass for valid optional fields', () => {
      const validData = {
        short_name: 'TT',
        conference: 'Test Conference',
        mascot: 'Test Mascot',
        colors: 'Red, Blue',
        website: 'https://testteam.com',
        logo_url: 'https://testteam.com/logo.png',
        city: 'Test City',
        state: 'Test State',
        country: 'USA'
      };
      expect(() => TeamValidator.validateOptionalFields(validData)).not.toThrow();
    });

    it('should pass for empty optional fields', () => {
      expect(() => TeamValidator.validateOptionalFields({})).not.toThrow();
    });

    it('should throw for invalid optional fields', () => {
      const invalidData = {
        short_name: 'A'.repeat(21), // Too long
        website: 'not-a-url' // Invalid URL
      };
      expect(() => TeamValidator.validateOptionalFields(invalidData))
        .toThrow('Short name must be no more than 20 characters long');
    });
  });

  describe('validateName', () => {
    it('should pass for valid names', () => {
      expect(() => TeamValidator.validateName('Test Team', 'name')).not.toThrow();
      expect(() => TeamValidator.validateName('A'.repeat(100), 'name')).not.toThrow();
    });

    it('should throw for invalid names', () => {
      expect(() => TeamValidator.validateName('', 'name'))
        .toThrow('Team name is required');
      expect(() => TeamValidator.validateName('   ', 'name'))
        .toThrow('Team name is required');
      expect(() => TeamValidator.validateName('A'.repeat(101), 'name'))
        .toThrow('Team name must be no more than 100 characters long');
    });

    it('should throw for non-string values', () => {
      expect(() => TeamValidator.validateName(123, 'name'))
        .toThrow('Team name must be a string');
      expect(() => TeamValidator.validateName(null, 'name'))
        .toThrow('Team name is required');
      expect(() => TeamValidator.validateName(undefined, 'name'))
        .toThrow('Team name is required');
    });

    it('should use default field name', () => {
      expect(() => TeamValidator.validateName('')).toThrow('Team name is required');
    });
  });

  describe('validateShortName', () => {
    it('should pass for valid short names', () => {
      expect(() => TeamValidator.validateShortName('TT', 'short_name')).not.toThrow();
      expect(() => TeamValidator.validateShortName('A', 'short_name')).not.toThrow();
      expect(() => TeamValidator.validateShortName('', 'short_name')).not.toThrow(); // Optional
    });

    it('should throw for invalid short names', () => {
      expect(() => TeamValidator.validateShortName('A'.repeat(21), 'short_name'))
        .toThrow('Short name must be no more than 20 characters long');
      expect(() => TeamValidator.validateShortName('A'.repeat(25), 'short_name'))
        .toThrow('Short name must be no more than 20 characters long');
    });

    it('should throw for non-string values', () => {
      expect(() => TeamValidator.validateShortName(123, 'short_name'))
        .toThrow('Short name must be a string');
      expect(() => TeamValidator.validateShortName(null, 'short_name'))
        .not.toThrow();
      expect(() => TeamValidator.validateShortName(undefined, 'short_name'))
        .not.toThrow();
    });

    it('should use default field name', () => {
      expect(() => TeamValidator.validateShortName('A'.repeat(21))).toThrow('Short name must be no more than 20 characters long');
    });
  });

  describe('validateSport', () => {
    it('should pass for valid sports', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men'
      })).not.toThrow();
    });

    it('should throw for invalid sports', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'invalid-sport',
        division: 'd1',
        gender: 'men'
      })).toThrow('Sport must be one of:');
    });
  });

  describe('validateDivision', () => {
    it('should pass for valid divisions', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men'
      })).not.toThrow();
    });

    it('should throw for invalid divisions', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd4',
        gender: 'men'
      })).toThrow('Division must be one of:');
    });
  });

  describe('validateGender', () => {
    it('should pass for valid genders', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men'
      })).not.toThrow();
    });

    it('should throw for invalid genders', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'invalid-gender'
      })).toThrow('Gender must be one of:');
    });
  });

  describe('validateConference', () => {
    it('should pass for valid conferences', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        conference: 'Test Conference'
      })).not.toThrow();
    });

    it('should throw for invalid conferences', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        conference: 'A'.repeat(101)
      })).toThrow('Conference must be no more than 100 characters long');
    });
  });

  describe('validateMascot', () => {
    it('should pass for valid mascots', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        mascot: 'Test Mascot'
      })).not.toThrow();
    });

    it('should throw for invalid mascots', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        mascot: 'A'.repeat(51)
      })).toThrow('Mascot must be no more than 50 characters long');
    });
  });

  describe('validateColors', () => {
    it('should pass for valid colors', () => {
      expect(() => TeamValidator.validateColors('Red, Blue', 'colors')).not.toThrow();
      expect(() => TeamValidator.validateColors('Red', 'colors')).not.toThrow();
      expect(() => TeamValidator.validateColors('', 'colors')).not.toThrow(); // Optional
    });

    it('should throw for invalid colors', () => {
      expect(() => TeamValidator.validateColors('A'.repeat(101), 'colors'))
        .toThrow('Colors must be no more than 100 characters long');
    });

    it('should pass for undefined and null values', () => {
      expect(() => TeamValidator.validateColors(undefined, 'colors')).not.toThrow();
      expect(() => TeamValidator.validateColors(null, 'colors')).not.toThrow();
    });

    it('should use default field name', () => {
      expect(() => TeamValidator.validateColors('A'.repeat(101)))
        .toThrow('Colors must be no more than 100 characters long');
    });
  });

  describe('validateWebsite', () => {
    it('should pass for valid websites', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        website: 'https://testteam.com'
      })).not.toThrow();
    });

    it('should throw for invalid websites', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        website: 'not-a-url'
      })).toThrow('Website must be a valid URL');
    });
  });

  describe('validateLogoUrl', () => {
    it('should pass for valid logo URLs', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        logo_url: 'https://testteam.com/logo.png'
      })).not.toThrow();
    });

    it('should throw for invalid logo URLs', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        logo_url: 'not-a-url'
      })).toThrow('Logo URL must be a valid URL');
    });
  });



  describe('validateCity', () => {
    it('should pass for valid cities', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        city: 'Test City'
      })).not.toThrow();
    });

    it('should throw for invalid cities', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        city: 'A'.repeat(51)
      })).toThrow('City must be no more than 50 characters long');
    });
  });

  describe('validateState', () => {
    it('should pass for valid states', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        state: 'Test State'
      })).not.toThrow();
    });

    it('should throw for invalid states', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        state: 'A'.repeat(51)
      })).toThrow('State must be no more than 50 characters long');
    });
  });

  describe('validateCountry', () => {
    it('should pass for valid countries', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        country: 'USA'
      })).not.toThrow();
    });

    it('should throw for invalid countries', () => {
      expect(() => TeamValidator.validateTeamData({
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        country: 'A'.repeat(51)
      })).toThrow('Country must be no more than 50 characters long');
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(TeamValidator.isValidUrl('https://testteam.com')).toBe(true);
      expect(TeamValidator.isValidUrl('http://testteam.com')).toBe(true);
      expect(TeamValidator.isValidUrl('https://testteam.com/path')).toBe(true);
      expect(TeamValidator.isValidUrl('https://testteam.com/path?param=value')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(TeamValidator.isValidUrl('not-a-url')).toBe(false);
      expect(TeamValidator.isValidUrl('')).toBe(false);
      expect(TeamValidator.isValidUrl(null)).toBe(false);
      expect(TeamValidator.isValidUrl(undefined)).toBe(false);
      expect(TeamValidator.isValidUrl(123)).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return max lengths', () => {
      const maxLengths = TeamValidator.getMaxLengths();
      expect(maxLengths).toEqual({
        name: 100,
        short_name: 20,
        mascot: 50,
        city: 50,
        state: 50,
        country: 50,
        conference: 100,
        website: 255,
        logo_url: 500,
        colors: 100
      });
    });
  });
});

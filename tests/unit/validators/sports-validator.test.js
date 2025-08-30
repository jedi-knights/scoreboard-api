import { SportsValidator } from '../../../src/validators/sports-validator.js';

describe('SportsValidator', () => {
  describe('validateSport', () => {
    it('should pass for valid sports', () => {
      expect(() => SportsValidator.validateSport('soccer', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('football', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('basketball', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('baseball', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('softball', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('volleyball', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('tennis', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('golf', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('swimming', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('track', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('cross-country', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('lacrosse', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('field-hockey', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('ice-hockey', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('wrestling', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('gymnastics', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('rowing', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('sailing', 'sport')).not.toThrow();
    });

    it('should pass for valid sports with different casing', () => {
      expect(() => SportsValidator.validateSport('SOCCER', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('Football', 'sport')).not.toThrow();
      expect(() => SportsValidator.validateSport('BASKETBALL', 'sport')).not.toThrow();
    });

    it('should throw for invalid sports', () => {
      expect(() => SportsValidator.validateSport('invalid-sport', 'sport'))
        .toThrow('sport must be one of: soccer, football, basketball, baseball, softball, volleyball, tennis, golf, swimming, track, cross-country, lacrosse, field-hockey, ice-hockey, wrestling, gymnastics, rowing, sailing');
      expect(() => SportsValidator.validateSport('hockey', 'sport'))
        .toThrow('sport must be one of: soccer, football, basketball, baseball, softball, volleyball, tennis, golf, swimming, track, cross-country, lacrosse, field-hockey, ice-hockey, wrestling, gymnastics, rowing, sailing');
      expect(() => SportsValidator.validateSport('', 'sport'))
        .toThrow('sport must be one of: soccer, football, basketball, baseball, softball, volleyball, tennis, golf, swimming, track, cross-country, lacrosse, field-hockey, ice-hockey, wrestling, gymnastics, rowing, sailing');
    });

    it('should throw for non-string values', () => {
      expect(() => SportsValidator.validateSport(123, 'sport'))
        .toThrow('sport must be a string');
      expect(() => SportsValidator.validateSport(null, 'sport'))
        .toThrow('sport must be a string');
      expect(() => SportsValidator.validateSport(undefined, 'sport'))
        .toThrow('sport must be a string');
    });

    it('should use default field name', () => {
      expect(() => SportsValidator.validateSport('invalid-sport'))
        .toThrow('Sport must be one of: soccer, football, basketball, baseball, softball, volleyball, tennis, golf, swimming, track, cross-country, lacrosse, field-hockey, ice-hockey, wrestling, gymnastics, rowing, sailing');
    });
  });

  describe('validateDivision', () => {
    it('should pass for valid divisions', () => {
      expect(() => SportsValidator.validateDivision('d1', 'division')).not.toThrow();
      expect(() => SportsValidator.validateDivision('d2', 'division')).not.toThrow();
      expect(() => SportsValidator.validateDivision('d3', 'division')).not.toThrow();
      expect(() => SportsValidator.validateDivision('naia', 'division')).not.toThrow();
      expect(() => SportsValidator.validateDivision('njcaa', 'division')).not.toThrow();
    });

    it('should pass for valid divisions with different casing', () => {
      expect(() => SportsValidator.validateDivision('D1', 'division')).not.toThrow();
      expect(() => SportsValidator.validateDivision('NAIA', 'division')).not.toThrow();
      expect(() => SportsValidator.validateDivision('Njcaa', 'division')).not.toThrow();
    });

    it('should throw for invalid divisions', () => {
      expect(() => SportsValidator.validateDivision('d4', 'division'))
        .toThrow('division must be one of: d1, d2, d3, naia, njcaa');
      expect(() => SportsValidator.validateDivision('professional', 'division'))
        .toThrow('division must be one of: d1, d2, d3, naia, njcaa');
      expect(() => SportsValidator.validateDivision('', 'division'))
        .toThrow('division must be one of: d1, d2, d3, naia, njcaa');
    });

    it('should throw for non-string values', () => {
      expect(() => SportsValidator.validateDivision(123, 'division'))
        .toThrow('division must be a string');
      expect(() => SportsValidator.validateDivision(null, 'division'))
        .toThrow('division must be a string');
      expect(() => SportsValidator.validateDivision(undefined, 'division'))
        .toThrow('division must be a string');
    });

    it('should use default field name', () => {
      expect(() => SportsValidator.validateDivision('d4'))
        .toThrow('Division must be one of: d1, d2, d3, naia, njcaa');
    });
  });

  describe('validateGender', () => {
    it('should pass for valid genders', () => {
      expect(() => SportsValidator.validateGender('men', 'gender')).not.toThrow();
      expect(() => SportsValidator.validateGender('women', 'gender')).not.toThrow();
      expect(() => SportsValidator.validateGender('coed', 'gender')).not.toThrow();
    });

    it('should pass for valid genders with different casing', () => {
      expect(() => SportsValidator.validateGender('MEN', 'gender')).not.toThrow();
      expect(() => SportsValidator.validateGender('Women', 'gender')).not.toThrow();
      expect(() => SportsValidator.validateGender('COED', 'gender')).not.toThrow();
    });

    it('should throw for invalid genders', () => {
      expect(() => SportsValidator.validateGender('mixed', 'gender'))
        .toThrow('gender must be one of: men, women, coed');
      expect(() => SportsValidator.validateGender('other', 'gender'))
        .toThrow('gender must be one of: men, women, coed');
      expect(() => SportsValidator.validateGender('', 'gender'))
        .toThrow('gender must be one of: men, women, coed');
    });

    it('should throw for non-string values', () => {
      expect(() => SportsValidator.validateGender(123, 'gender'))
        .toThrow('gender must be a string');
      expect(() => SportsValidator.validateGender(null, 'gender'))
        .toThrow('gender must be a string');
      expect(() => SportsValidator.validateGender(undefined, 'gender'))
        .toThrow('gender must be a string');
    });

    it('should use default field name', () => {
      expect(() => SportsValidator.validateGender('mixed'))
        .toThrow('Gender must be one of: men, women, coed');
    });
  });

  describe('isValidSport', () => {
    it('should return true for valid sports', () => {
      expect(SportsValidator.isValidSport('soccer')).toBe(true);
      expect(SportsValidator.isValidSport('football')).toBe(true);
      expect(SportsValidator.isValidSport('basketball')).toBe(true);
      expect(SportsValidator.isValidSport('baseball')).toBe(true);
      expect(SportsValidator.isValidSport('softball')).toBe(true);
      expect(SportsValidator.isValidSport('volleyball')).toBe(true);
      expect(SportsValidator.isValidSport('tennis')).toBe(true);
      expect(SportsValidator.isValidSport('golf')).toBe(true);
      expect(SportsValidator.isValidSport('swimming')).toBe(true);
      expect(SportsValidator.isValidSport('track')).toBe(true);
      expect(SportsValidator.isValidSport('cross-country')).toBe(true);
      expect(SportsValidator.isValidSport('lacrosse')).toBe(true);
      expect(SportsValidator.isValidSport('field-hockey')).toBe(true);
      expect(SportsValidator.isValidSport('ice-hockey')).toBe(true);
      expect(SportsValidator.isValidSport('wrestling')).toBe(true);
      expect(SportsValidator.isValidSport('gymnastics')).toBe(true);
      expect(SportsValidator.isValidSport('rowing')).toBe(true);
      expect(SportsValidator.isValidSport('sailing')).toBe(true);
    });

    it('should return true for valid sports with different casing', () => {
      expect(SportsValidator.isValidSport('SOCCER')).toBe(true);
      expect(SportsValidator.isValidSport('Football')).toBe(true);
      expect(SportsValidator.isValidSport('BASKETBALL')).toBe(true);
    });

    it('should return false for invalid sports', () => {
      expect(SportsValidator.isValidSport('invalid-sport')).toBe(false);
      expect(SportsValidator.isValidSport('hockey')).toBe(false);
      expect(SportsValidator.isValidSport('')).toBe(false);
      expect(SportsValidator.isValidSport(null)).toBe(false);
      expect(SportsValidator.isValidSport(undefined)).toBe(false);
      expect(SportsValidator.isValidSport(123)).toBe(false);
    });
  });

  describe('isValidDivision', () => {
    it('should return true for valid divisions', () => {
      expect(SportsValidator.isValidDivision('d1')).toBe(true);
      expect(SportsValidator.isValidDivision('d2')).toBe(true);
      expect(SportsValidator.isValidDivision('d3')).toBe(true);
      expect(SportsValidator.isValidDivision('naia')).toBe(true);
      expect(SportsValidator.isValidDivision('njcaa')).toBe(true);
    });

    it('should return true for valid divisions with different casing', () => {
      expect(SportsValidator.isValidDivision('D1')).toBe(true);
      expect(SportsValidator.isValidDivision('NAIA')).toBe(true);
      expect(SportsValidator.isValidDivision('Njcaa')).toBe(true);
    });

    it('should return false for invalid divisions', () => {
      expect(SportsValidator.isValidDivision('d4')).toBe(false);
      expect(SportsValidator.isValidDivision('professional')).toBe(false);
      expect(SportsValidator.isValidDivision('')).toBe(false);
      expect(SportsValidator.isValidDivision(null)).toBe(false);
      expect(SportsValidator.isValidDivision(undefined)).toBe(false);
      expect(SportsValidator.isValidDivision(123)).toBe(false);
    });
  });

  describe('isValidGender', () => {
    it('should return true for valid genders', () => {
      expect(SportsValidator.isValidGender('men')).toBe(true);
      expect(SportsValidator.isValidGender('women')).toBe(true);
      expect(SportsValidator.isValidGender('coed')).toBe(true);
    });

    it('should return true for valid genders with different casing', () => {
      expect(SportsValidator.isValidGender('MEN')).toBe(true);
      expect(SportsValidator.isValidGender('Women')).toBe(true);
      expect(SportsValidator.isValidGender('COED')).toBe(true);
    });

    it('should return false for invalid genders', () => {
      expect(SportsValidator.isValidGender('mixed')).toBe(false);
      expect(SportsValidator.isValidGender('other')).toBe(false);
      expect(SportsValidator.isValidGender('')).toBe(false);
      expect(SportsValidator.isValidGender(null)).toBe(false);
      expect(SportsValidator.isValidGender(undefined)).toBe(false);
      expect(SportsValidator.isValidGender(123)).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return valid sports list', () => {
      const validSports = SportsValidator.getValidSports();
      expect(Array.isArray(validSports)).toBe(true);
      expect(validSports).toContain('soccer');
      expect(validSports).toContain('football');
      expect(validSports).toContain('basketball');
      expect(validSports).toContain('baseball');
      expect(validSports).toContain('softball');
      expect(validSports).toContain('volleyball');
      expect(validSports).toContain('tennis');
      expect(validSports).toContain('golf');
      expect(validSports).toContain('swimming');
      expect(validSports).toContain('track');
      expect(validSports).toContain('cross-country');
      expect(validSports).toContain('lacrosse');
      expect(validSports).toContain('field-hockey');
      expect(validSports).toContain('ice-hockey');
      expect(validSports).toContain('wrestling');
      expect(validSports).toContain('gymnastics');
      expect(validSports).toContain('rowing');
      expect(validSports).toContain('sailing');
      expect(validSports).toHaveLength(18);
    });

    it('should return valid divisions list', () => {
      const validDivisions = SportsValidator.getValidDivisions();
      expect(Array.isArray(validDivisions)).toBe(true);
      expect(validDivisions).toContain('d1');
      expect(validDivisions).toContain('d2');
      expect(validDivisions).toContain('d3');
      expect(validDivisions).toContain('naia');
      expect(validDivisions).toContain('njcaa');
      expect(validDivisions).toHaveLength(5);
    });

    it('should return valid genders list', () => {
      const validGenders = SportsValidator.getValidGenders();
      expect(Array.isArray(validGenders)).toBe(true);
      expect(validGenders).toContain('men');
      expect(validGenders).toContain('women');
      expect(validGenders).toContain('coed');
      expect(validGenders).toHaveLength(3);
    });
  });
});

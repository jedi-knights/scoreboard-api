/**
 * Conferences Service Tests
 * 
 * Tests for the ConferencesService class covering all methods,
 * error handling, and edge cases.
 */

import { jest } from '@jest/globals';
import { MockFactory } from '../../mocks/mock-factory.js';
import { ConferenceBuilder } from '../../builders/conference-builder.js';
import { ConferencesService } from '../../../src/services/conferences-service.js';

describe('ConferencesService', () => {
  let conferencesService;
  let mockConferencesRepository;
  let mockDatabaseAdapter;
  let mockTransactionManager;

  beforeEach(async () => {
    // Create mock dependencies
    mockConferencesRepository = MockFactory.createMockConferencesRepository();
    mockDatabaseAdapter = MockFactory.createMockDatabaseAdapter();
    mockTransactionManager = MockFactory.createMockTransactionManager();
    
    // Create service instance
    conferencesService = new ConferencesService(mockConferencesRepository, mockDatabaseAdapter);
    
    // Replace the transaction manager with our mock
    conferencesService.transactionManager = mockTransactionManager;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create service with injected dependencies', () => {
      expect(conferencesService).toBeInstanceOf(ConferencesService);
      expect(conferencesService.conferencesRepository).toBe(mockConferencesRepository);
      expect(conferencesService.databaseAdapter).toBe(mockDatabaseAdapter);
      expect(conferencesService.transactionManager).toBe(mockTransactionManager);
    });

    it('should throw error if repository is not provided', () => {
      expect(() => new ConferencesService(null, mockDatabaseAdapter)).toThrow();
    });

    it('should throw error if database adapter is not provided', () => {
      expect(() => new ConferencesService(mockConferencesRepository, null)).toThrow();
    });
  });

  describe('findOrCreateConference', () => {
    const validConferenceData = ConferenceBuilder.buildValidConference();

    it('should successfully find or create a conference', async () => {
      // Arrange
      const mockConference = { id: 1, name: 'Test Conference', sport: 'basketball' };
      mockConferencesRepository.findOrCreate.mockResolvedValue(mockConference);

      // Act
      const result = await conferencesService.findOrCreateConference(validConferenceData);

      // Assert
      expect(mockConferencesRepository.findOrCreate).toHaveBeenCalledWith(validConferenceData);
      expect(result).toEqual(mockConference);
    });

    it('should validate conference data before processing', async () => {
      // Arrange
      const invalidConferenceData = { name: '', sport: 'invalid-sport' };
      const validationError = new Error('Invalid conference data');
      
      // Mock validation to throw error
      jest.spyOn(conferencesService, 'validateConferenceData').mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(conferencesService.findOrCreateConference(invalidConferenceData)).rejects.toThrow(validationError);
      expect(mockConferencesRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockConferencesRepository.findOrCreate.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(conferencesService.findOrCreateConference(validConferenceData)).rejects.toThrow(repositoryError);
    });

    it('should handle validation errors from repository', async () => {
      // Arrange
      const validationError = new Error('Conference name already exists');
      mockConferencesRepository.findOrCreate.mockRejectedValue(validationError);

      // Act & Assert
      await expect(conferencesService.findOrCreateConference(validConferenceData)).rejects.toThrow(validationError);
    });

    it('should handle very large conference data objects', async () => {
      // Arrange
      const largeConferenceData = {
        ...validConferenceData,
        description: 'A'.repeat(10000),
        metadata: {
          tags: Array(1000).fill().map((_, i) => `tag-${i}`),
          customFields: Object.fromEntries(
            Array(100).fill().map((_, i) => [`field${i}`, `value${i}`])
          )
        }
      };

      const mockConference = { id: 1, name: 'Test Conference' };
      mockConferencesRepository.findOrCreate.mockResolvedValue(mockConference);

      // Act
      const result = await conferencesService.findOrCreateConference(largeConferenceData);

      // Assert
      expect(mockConferencesRepository.findOrCreate).toHaveBeenCalledWith(largeConferenceData);
      expect(result).toEqual(mockConference);
    });
  });

  describe('getConferenceByName', () => {
    it('should successfully get conference by name and criteria', async () => {
      // Arrange
      const mockConference = { id: 1, name: 'Test Conference', sport: 'basketball', division: 'd1' };
      mockConferencesRepository.findByName.mockResolvedValue(mockConference);

      // Act
      const result = await conferencesService.getConferenceByName('Test Conference', 'basketball', 'd1', 'men');

      // Assert
      expect(mockConferencesRepository.findByName).toHaveBeenCalledWith('Test Conference', 'basketball', 'd1', 'men');
      expect(result).toEqual(mockConference);
    });

    it('should return null when conference not found', async () => {
      // Arrange
      mockConferencesRepository.findByName.mockResolvedValue(null);

      // Act
      const result = await conferencesService.getConferenceByName('Non-existent Conference', 'basketball', 'd1', 'men');

      // Assert
      expect(result).toBeNull();
      expect(mockConferencesRepository.findByName).toHaveBeenCalledWith('Non-existent Conference', 'basketball', 'd1', 'men');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockConferencesRepository.findByName.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(conferencesService.getConferenceByName('Test Conference', 'basketball', 'd1', 'men'))
        .rejects.toThrow(repositoryError);
    });

    it('should handle partial criteria searches', async () => {
      // Arrange
      const mockConference = { id: 1, name: 'Test Conference' };
      mockConferencesRepository.findByName.mockResolvedValue(mockConference);

      // Act - Search with only name
      const result = await conferencesService.getConferenceByName('Test Conference');

      // Assert
      expect(mockConferencesRepository.findByName).toHaveBeenCalledWith('Test Conference', undefined, undefined, undefined);
      expect(result).toEqual(mockConference);
    });

    it('should handle special characters in conference names', async () => {
      // Arrange
      const specialName = 'Atlantic Coast Conference (ACC)';
      const mockConference = { id: 1, name: specialName };
      mockConferencesRepository.findByName.mockResolvedValue(mockConference);

      // Act
      const result = await conferencesService.getConferenceByName(specialName, 'basketball', 'd1', 'men');

      // Assert
      expect(mockConferencesRepository.findByName).toHaveBeenCalledWith(specialName, 'basketball', 'd1', 'men');
      expect(result).toEqual(mockConference);
    });
  });

  describe('getConferences', () => {
    it('should successfully get conferences with filters and options', async () => {
      // Arrange
      const mockConferences = [
        { id: 1, name: 'ACC', sport: 'basketball' },
        { id: 2, name: 'Big Ten', sport: 'football' }
      ];
      const mockResult = { conferences: mockConferences, total: 2, page: 1 };
      mockConferencesRepository.findAll.mockResolvedValue(mockResult);

      const filters = { sport: 'basketball' };
      const options = { limit: 10, offset: 0 };

      // Act
      const result = await conferencesService.getConferences(filters, options);

      // Assert
      expect(mockConferencesRepository.findAll).toHaveBeenCalledWith(filters, options);
      expect(result).toEqual(mockResult);
    });

    it('should handle empty filters and options', async () => {
      // Arrange
      const mockResult = { conferences: [], total: 0, page: 1 };
      mockConferencesRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await conferencesService.getConferences();

      // Assert
      expect(mockConferencesRepository.findAll).toHaveBeenCalledWith({}, {});
      expect(result).toEqual(mockResult);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockConferencesRepository.findAll.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(conferencesService.getConferences()).rejects.toThrow(repositoryError);
    });

    it('should handle complex filtering scenarios', async () => {
      // Arrange
      const mockResult = { conferences: [], total: 0 };
      mockConferencesRepository.findAll.mockResolvedValue(mockResult);

      const complexFilters = {
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        region: 'East',
        active: true,
        established: '1953'
      };

      const complexOptions = {
        limit: 25,
        offset: 50,
        sortBy: 'name',
        sortOrder: 'ASC'
      };

      // Act
      await conferencesService.getConferences(complexFilters, complexOptions);

      // Assert
      expect(mockConferencesRepository.findAll).toHaveBeenCalledWith(complexFilters, complexOptions);
    });
  });

  describe('updateConference', () => {
    const updateData = { name: 'Updated Conference Name', sport: 'football' };

    it('should successfully update a conference', async () => {
      // Arrange
      const mockUpdatedConference = { id: 1, name: 'Updated Conference Name', sport: 'football' };
      mockConferencesRepository.update.mockResolvedValue(mockUpdatedConference);

      // Act
      const result = await conferencesService.updateConference(1, updateData);

      // Assert
      expect(mockConferencesRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(mockUpdatedConference);
    });

    it('should validate sport before update', async () => {
      // Arrange
      const invalidUpdateData = { sport: 'invalid-sport' };
      const validationError = new Error('Invalid sport: invalid-sport');
      
      jest.spyOn(conferencesService, 'isValidSport').mockReturnValue(false);

      // Act & Assert
      await expect(conferencesService.updateConference(1, invalidUpdateData)).rejects.toThrow(validationError);
      expect(mockConferencesRepository.update).not.toHaveBeenCalled();
    });

    it('should validate division before update', async () => {
      // Arrange
      const invalidUpdateData = { division: 'invalid-division' };
      const validationError = new Error('Invalid division: invalid-division');
      
      jest.spyOn(conferencesService, 'isValidDivision').mockReturnValue(false);

      // Act & Assert
      await expect(conferencesService.updateConference(1, invalidUpdateData)).rejects.toThrow(validationError);
      expect(mockConferencesRepository.update).not.toHaveBeenCalled();
    });

    it('should validate gender before update', async () => {
      // Arrange
      const invalidUpdateData = { gender: 'invalid-gender' };
      const validationError = new Error('Invalid gender: invalid-gender');
      
      jest.spyOn(conferencesService, 'isValidGender').mockReturnValue(false);

      // Act & Assert
      await expect(conferencesService.updateConference(1, invalidUpdateData)).rejects.toThrow(validationError);
      expect(mockConferencesRepository.update).not.toHaveBeenCalled();
    });

    it('should handle conference not found gracefully', async () => {
      // Arrange
      mockConferencesRepository.update.mockResolvedValue(null);

      // Act
      const result = await conferencesService.updateConference(999, updateData);

      // Assert
      expect(result).toBeNull();
      expect(mockConferencesRepository.update).toHaveBeenCalledWith(999, updateData);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockConferencesRepository.update.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(conferencesService.updateConference(1, updateData)).rejects.toThrow(repositoryError);
    });

    it('should validate multiple fields correctly', async () => {
      // Arrange
      const complexUpdateData = {
        sport: 'basketball',
        division: 'd1',
        gender: 'women'
      };

      jest.spyOn(conferencesService, 'isValidSport').mockReturnValue(true);
      jest.spyOn(conferencesService, 'isValidDivision').mockReturnValue(true);
      jest.spyOn(conferencesService, 'isValidGender').mockReturnValue(true);

      const mockUpdatedConference = { id: 1, ...complexUpdateData };
      mockConferencesRepository.update.mockResolvedValue(mockUpdatedConference);

      // Act
      const result = await conferencesService.updateConference(1, complexUpdateData);

      // Assert
      expect(mockConferencesRepository.update).toHaveBeenCalledWith(1, complexUpdateData);
      expect(result).toEqual(mockUpdatedConference);
    });
  });

  // Note: getConferenceById method doesn't exist on ConferencesService

  // Note: createConference method doesn't exist on ConferencesService

  // Note: deleteConference and getConferenceStatistics methods don't exist on ConferencesService

  describe('Validation Methods', () => {
    describe('validateConferenceData', () => {
      it('should validate required fields', () => {
        // Arrange
        const invalidConferenceData = { sport: 'basketball' }; // Missing name

        // Act & Assert
        expect(() => conferencesService.validateConferenceData(invalidConferenceData)).toThrow();
      });

      it('should validate sport values', () => {
        // Arrange
        const invalidConferenceData = { name: 'Test Conference', sport: 'invalid-sport' };

        // Act & Assert
        expect(() => conferencesService.validateConferenceData(invalidConferenceData)).toThrow();
      });

      it('should validate division values', () => {
        // Arrange
        const invalidConferenceData = { name: 'Test Conference', sport: 'basketball', division: 'invalid-division' };

        // Act & Assert
        expect(() => conferencesService.validateConferenceData(invalidConferenceData)).toThrow();
      });

      it('should validate gender values', () => {
        // Arrange
        const invalidConferenceData = { name: 'Test Conference', sport: 'basketball', gender: 'invalid-gender' };

        // Act & Assert
        expect(() => conferencesService.validateConferenceData(invalidConferenceData)).toThrow();
      });

      it('should pass validation for valid data', () => {
        // Arrange
        const validConferenceData = ConferenceBuilder.buildValidConference();

        // Act & Assert
        expect(() => conferencesService.validateConferenceData(validConferenceData)).not.toThrow();
      });
    });

    describe('isValidSport', () => {
      it('should return true for valid sports', () => {
        const validSports = ['basketball', 'football', 'soccer', 'baseball'];
        
        validSports.forEach(sport => {
          expect(conferencesService.isValidSport(sport)).toBe(true);
        });
      });

      it('should return false for invalid sports', () => {
        const invalidSports = ['invalid-sport', '', null, undefined];
        
        invalidSports.forEach(sport => {
          expect(conferencesService.isValidSport(sport)).toBe(false);
        });
      });
    });

    describe('isValidDivision', () => {
      it('should return true for valid divisions', () => {
        const validDivisions = ['d1', 'd2', 'd3', 'naia'];
        
        validDivisions.forEach(division => {
          expect(conferencesService.isValidDivision(division)).toBe(true);
        });
      });

      it('should return false for invalid divisions', () => {
        const invalidDivisions = ['invalid-division', '', null, undefined];
        
        invalidDivisions.forEach(division => {
          expect(conferencesService.isValidDivision(division)).toBe(false);
        });
      });
    });

    describe('isValidGender', () => {
      it('should return true for valid genders', () => {
        const validGenders = ['men', 'women', 'mixed'];
        
        validGenders.forEach(gender => {
          expect(conferencesService.isValidGender(gender)).toBe(true);
        });
      });

      it('should return false for invalid genders', () => {
        const invalidGenders = ['invalid-gender', '', null, undefined];
        
        invalidGenders.forEach(gender => {
          expect(conferencesService.isValidGender(gender)).toBe(false);
        });
      });
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle concurrent conference operations', async () => {
      // Arrange
      const mockConference = { id: 1, name: 'Test Conference' };
      mockConferencesRepository.findOrCreate.mockResolvedValue(mockConference);

      // Act - Simulate concurrent operations
      const promises = [
        conferencesService.findOrCreateConference(ConferenceBuilder.buildValidConference()),
        conferencesService.findOrCreateConference(ConferenceBuilder.buildValidConference({ name: 'Conference B' })),
        conferencesService.findOrCreateConference(ConferenceBuilder.buildValidConference({ name: 'Conference C' }))
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      expect(mockConferencesRepository.findOrCreate).toHaveBeenCalledTimes(3);
    });

    it('should handle very large conference datasets', async () => {
      // Arrange
      const largeConferenceArray = Array(10000).fill().map((_, i) => ({
        id: i + 1,
        name: `Conference ${i + 1}`,
        sport: 'basketball'
      }));
      
      const mockResult = { conferences: largeConferenceArray, total: 10000, page: 1 };
      mockConferencesRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await conferencesService.getConferences();

      // Assert
      expect(result.conferences).toHaveLength(10000);
      expect(result.total).toBe(10000);
    });

    it('should handle malformed conference data gracefully', async () => {
      // Arrange
      const malformedData = {
        name: 'Test Conference',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        extraField: 'should be ignored',
        nestedField: { invalid: 'structure' }
      };

      const mockConference = { id: 1, name: 'Test Conference', sport: 'basketball' };
      mockConferencesRepository.findOrCreate.mockResolvedValue(mockConference);

      // Act
      const result = await conferencesService.findOrCreateConference(malformedData);

      // Assert
      expect(mockConferencesRepository.findOrCreate).toHaveBeenCalledWith(malformedData);
      expect(result).toEqual(mockConference);
    });

    it('should handle special characters and unicode in conference names', async () => {
      // Arrange
      const specialNames = [
        'Atlantic Coast Conference (ACC)',
        'Big Ten Conference',
        'Southeastern Conference (SEC)',
        'Pac-12 Conference',
        'Big 12 Conference',
        'American Athletic Conference (AAC)'
      ];

      for (const specialName of specialNames) {
        const mockConference = { id: 1, name: specialName };
        mockConferencesRepository.findByName.mockResolvedValue(mockConference);

        // Act
        const result = await conferencesService.getConferenceByName(specialName);

        // Assert
        expect(result.name).toBe(specialName);
      }
    });
  });
});

/**
 * Teams Service Tests
 * 
 * Tests for the TeamsService class covering all methods,
 * error handling, and edge cases.
 */

import { jest } from '@jest/globals';
import { MockFactory } from '../../mocks/mock-factory.js';
import { TeamBuilder } from '../../builders/team-builder.js';
import { TeamsService } from '../../../src/services/teams-service.js';

describe('TeamsService', () => {
  let teamsService;
  let mockTeamsRepository;
  let mockDatabaseAdapter;
  let mockTransactionManager;

  beforeEach(async () => {
    // Create mock dependencies
    mockTeamsRepository = MockFactory.createMockTeamsRepository();
    mockDatabaseAdapter = MockFactory.createMockDatabaseAdapter();
    mockTransactionManager = MockFactory.createMockTransactionManager();
    
    // Create service instance
    teamsService = new TeamsService(mockTeamsRepository, mockDatabaseAdapter);
    
    // Replace the transaction manager with our mock
    teamsService.transactionManager = mockTransactionManager;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create service with injected dependencies', () => {
      expect(teamsService).toBeInstanceOf(TeamsService);
      expect(teamsService.teamsRepository).toBe(mockTeamsRepository);
      expect(teamsService.databaseAdapter).toBe(mockDatabaseAdapter);
      expect(teamsService.transactionManager).toBe(mockTransactionManager);
    });

    it('should throw error if repository is not provided', () => {
      expect(() => new TeamsService(null, mockDatabaseAdapter)).toThrow();
    });

    it('should throw error if database adapter is not provided', () => {
      expect(() => new TeamsService(mockTeamsRepository, null)).toThrow();
    });
  });

  describe('findOrCreateTeam', () => {
    const validTeamData = TeamBuilder.buildValidTeam();

    it('should successfully find or create a team', async () => {
      // Arrange
      const mockTeam = { id: 1, name: 'Test Team', sport: 'basketball' };
      mockTeamsRepository.findOrCreate.mockResolvedValue(mockTeam);

      // Act
      const result = await teamsService.findOrCreateTeam(validTeamData);

      // Assert
      expect(mockTeamsRepository.findOrCreate).toHaveBeenCalledWith(validTeamData);
      expect(result).toEqual(mockTeam);
    });

    it('should validate team data before processing', async () => {
      // Arrange
      const invalidTeamData = { name: '', sport: 'invalid-sport' };
      const validationError = new Error('Invalid team data');
      
      // Mock validation to throw error
      jest.spyOn(teamsService, 'validateTeamData').mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(teamsService.findOrCreateTeam(invalidTeamData)).rejects.toThrow(validationError);
      expect(mockTeamsRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockTeamsRepository.findOrCreate.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(teamsService.findOrCreateTeam(validTeamData)).rejects.toThrow(repositoryError);
    });

    it('should handle validation errors from repository', async () => {
      // Arrange
      const validationError = new Error('Team name already exists');
      mockTeamsRepository.findOrCreate.mockRejectedValue(validationError);

      // Act & Assert
      await expect(teamsService.findOrCreateTeam(validTeamData)).rejects.toThrow(validationError);
    });

    it('should handle very large team data objects', async () => {
      // Arrange
      const largeTeamData = {
        ...validTeamData,
        description: 'A'.repeat(10000),
        metadata: {
          tags: Array(1000).fill().map((_, i) => `tag-${i}`),
          customFields: Object.fromEntries(
            Array(100).fill().map((_, i) => [`field${i}`, `value${i}`])
          )
        }
      };

      const mockTeam = { id: 1, name: 'Test Team' };
      mockTeamsRepository.findOrCreate.mockResolvedValue(mockTeam);

      // Act
      const result = await teamsService.findOrCreateTeam(largeTeamData);

      // Assert
      expect(mockTeamsRepository.findOrCreate).toHaveBeenCalledWith(largeTeamData);
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getTeamByName', () => {
    it('should successfully get team by name and criteria', async () => {
      // Arrange
      const mockTeam = { id: 1, name: 'Test Team', sport: 'basketball', division: 'd1' };
      mockTeamsRepository.findByName.mockResolvedValue(mockTeam);

      // Act
      const result = await teamsService.getTeamByName('Test Team', 'basketball', 'd1', 'men');

      // Assert
      expect(mockTeamsRepository.findByName).toHaveBeenCalledWith('Test Team', 'basketball', 'd1', 'men');
      expect(result).toEqual(mockTeam);
    });

    it('should return null when team not found', async () => {
      // Arrange
      mockTeamsRepository.findByName.mockResolvedValue(null);

      // Act
      const result = await teamsService.getTeamByName('Non-existent Team', 'basketball', 'd1', 'men');

      // Assert
      expect(result).toBeNull();
      expect(mockTeamsRepository.findByName).toHaveBeenCalledWith('Non-existent Team', 'basketball', 'd1', 'men');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockTeamsRepository.findByName.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(teamsService.getTeamByName('Test Team', 'basketball', 'd1', 'men'))
        .rejects.toThrow(repositoryError);
    });

    it('should handle partial criteria searches', async () => {
      // Arrange
      const mockTeam = { id: 1, name: 'Test Team' };
      mockTeamsRepository.findByName.mockResolvedValue(mockTeam);

      // Act - Search with only name
      const result = await teamsService.getTeamByName('Test Team');

      // Assert
      expect(mockTeamsRepository.findByName).toHaveBeenCalledWith('Test Team', undefined, undefined, undefined);
      expect(result).toEqual(mockTeam);
    });

    it('should handle special characters in team names', async () => {
      // Arrange
      const specialName = 'Team & Sons, Inc.';
      const mockTeam = { id: 1, name: specialName };
      mockTeamsRepository.findByName.mockResolvedValue(mockTeam);

      // Act
      const result = await teamsService.getTeamByName(specialName, 'basketball', 'd1', 'men');

      // Assert
      expect(mockTeamsRepository.findByName).toHaveBeenCalledWith(specialName, 'basketball', 'd1', 'men');
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getTeamsByConference', () => {
    it('should successfully get teams by conference', async () => {
      // Arrange
      const mockTeams = [
        { id: 1, name: 'Team A', conference: 'Test Conference' },
        { id: 2, name: 'Team B', conference: 'Test Conference' }
      ];
      mockTeamsRepository.findByConference.mockResolvedValue(mockTeams);

      // Act
      const result = await teamsService.getTeamsByConference('Test Conference', { sport: 'basketball' });

      // Assert
      expect(mockTeamsRepository.findByConference).toHaveBeenCalledWith('Test Conference', 'basketball', undefined);
      expect(result).toEqual({
        teams: mockTeams,
        conference: 'Test Conference',
        total: 2
      });
    });

    it('should handle empty conference results', async () => {
      // Arrange
      mockTeamsRepository.findByConference.mockResolvedValue([]);

      // Act
      const result = await teamsService.getTeamsByConference('Empty Conference');

      // Assert
      expect(result).toEqual({
        teams: [],
        conference: 'Empty Conference',
        total: 0
      });
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockTeamsRepository.findByConference.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(teamsService.getTeamsByConference('Test Conference'))
        .rejects.toThrow(repositoryError);
    });

    it('should apply sport and division filters correctly', async () => {
      // Arrange
      const mockTeams = [{ id: 1, name: 'Team A' }];
      mockTeamsRepository.findByConference.mockResolvedValue(mockTeams);

      // Act
      await teamsService.getTeamsByConference('Test Conference', { 
        sport: 'football', 
        division: 'd2' 
      });

      // Assert
      expect(mockTeamsRepository.findByConference).toHaveBeenCalledWith('Test Conference', 'football', 'd2');
    });
  });

  describe('getTeams', () => {
    it('should successfully get teams with filters and options', async () => {
      // Arrange
      const mockTeams = [
        { id: 1, name: 'Team A', sport: 'basketball' },
        { id: 2, name: 'Team B', sport: 'football' }
      ];
      const mockResult = { teams: mockTeams, total: 2, page: 1 };
      mockTeamsRepository.findAll.mockResolvedValue(mockResult);

      const filters = { sport: 'basketball' };
      const options = { limit: 10, offset: 0 };

      // Act
      const result = await teamsService.getTeams(filters, options);

      // Assert
      expect(mockTeamsRepository.findAll).toHaveBeenCalledWith(filters, options);
      expect(result).toEqual(mockResult);
    });

    it('should handle empty filters and options', async () => {
      // Arrange
      const mockResult = { teams: [], total: 0, page: 1 };
      mockTeamsRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await teamsService.getTeams();

      // Assert
      expect(mockTeamsRepository.findAll).toHaveBeenCalledWith({}, {});
      expect(result).toEqual(mockResult);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockTeamsRepository.findAll.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(teamsService.getTeams()).rejects.toThrow(repositoryError);
    });

    it('should handle complex filtering scenarios', async () => {
      // Arrange
      const mockResult = { teams: [], total: 0 };
      mockTeamsRepository.findAll.mockResolvedValue(mockResult);

      const complexFilters = {
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        conference: 'ACC',
        state: 'NC',
        active: true
      };

      const complexOptions = {
        limit: 25,
        offset: 50,
        sortBy: 'name',
        sortOrder: 'ASC'
      };

      // Act
      await teamsService.getTeams(complexFilters, complexOptions);

      // Assert
      expect(mockTeamsRepository.findAll).toHaveBeenCalledWith(complexFilters, complexOptions);
    });
  });

  // Note: getTeamById method doesn't exist on TeamsService

  // Note: createTeam method doesn't exist on TeamsService

  describe('updateTeam', () => {
    const updateData = { name: 'Updated Team Name', sport: 'football' };

    it('should successfully update a team', async () => {
      // Arrange
      const mockUpdatedTeam = { id: 1, name: 'Updated Team Name', sport: 'football' };
      mockTeamsRepository.update.mockResolvedValue(mockUpdatedTeam);

      // Act
      const result = await teamsService.updateTeam(1, updateData);

      // Assert
      expect(mockTeamsRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(mockUpdatedTeam);
    });

    it('should validate update data before processing', async () => {
      // Arrange
      const invalidUpdateData = { sport: 'invalid-sport' };
      const validationError = new Error('Invalid sport: invalid-sport');
      
      jest.spyOn(teamsService, 'isValidSport').mockReturnValue(false);

      // Act & Assert
      await expect(teamsService.updateTeam(1, invalidUpdateData)).rejects.toThrow(validationError);
      expect(mockTeamsRepository.update).not.toHaveBeenCalled();
    });

    it('should handle team not found gracefully', async () => {
      // Arrange
      mockTeamsRepository.update.mockResolvedValue(null);

      // Act
      const result = await teamsService.updateTeam(999, updateData);

      // Assert
      expect(result).toBeNull();
      expect(mockTeamsRepository.update).toHaveBeenCalledWith(999, updateData);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockTeamsRepository.update.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(teamsService.updateTeam(1, updateData)).rejects.toThrow(repositoryError);
    });

    it('should validate multiple fields correctly', async () => {
      // Arrange
      const complexUpdateData = {
        sport: 'basketball',
        division: 'd1',
        gender: 'women'
      };

      jest.spyOn(teamsService, 'isValidSport').mockReturnValue(true);
      jest.spyOn(teamsService, 'isValidDivision').mockReturnValue(true);
      jest.spyOn(teamsService, 'isValidGender').mockReturnValue(true);

      const mockUpdatedTeam = { id: 1, ...complexUpdateData };
      mockTeamsRepository.update.mockResolvedValue(mockUpdatedTeam);

      // Act
      const result = await teamsService.updateTeam(1, complexUpdateData);

      // Assert
      expect(mockTeamsRepository.update).toHaveBeenCalledWith(1, complexUpdateData);
      expect(result).toEqual(mockUpdatedTeam);
    });
  });

  // Note: deleteTeam and getTeamStatistics methods don't exist on TeamsService

  describe('Validation Methods', () => {
    describe('validateTeamData', () => {
      it('should validate required fields', () => {
        // Arrange
        const invalidTeamData = { sport: 'basketball' }; // Missing name

        // Act & Assert
        expect(() => teamsService.validateTeamData(invalidTeamData)).toThrow();
      });

      it('should validate sport values', () => {
        // Arrange
        const invalidTeamData = { name: 'Test Team', sport: 'invalid-sport' };

        // Act & Assert
        expect(() => teamsService.validateTeamData(invalidTeamData)).toThrow();
      });

      it('should validate division values', () => {
        // Arrange
        const invalidTeamData = { name: 'Test Team', sport: 'basketball', division: 'invalid-division' };

        // Act & Assert
        expect(() => teamsService.validateTeamData(invalidTeamData)).toThrow();
      });

      it('should validate gender values', () => {
        // Arrange
        const invalidTeamData = { name: 'Test Team', sport: 'basketball', gender: 'invalid-gender' };

        // Act & Assert
        expect(() => teamsService.validateTeamData(invalidTeamData)).toThrow();
      });

      it('should pass validation for valid data', () => {
        // Arrange
        const validTeamData = TeamBuilder.buildValidTeam();

        // Act & Assert
        expect(() => teamsService.validateTeamData(validTeamData)).not.toThrow();
      });
    });

    describe('isValidSport', () => {
      it('should return true for valid sports', () => {
        const validSports = ['basketball', 'football', 'soccer', 'baseball'];
        
        validSports.forEach(sport => {
          expect(teamsService.isValidSport(sport)).toBe(true);
        });
      });

      it('should return false for invalid sports', () => {
        const invalidSports = ['invalid-sport', '', null, undefined];
        
        invalidSports.forEach(sport => {
          expect(teamsService.isValidSport(sport)).toBe(false);
        });
      });
    });

    describe('isValidDivision', () => {
      it('should return true for valid divisions', () => {
        const validDivisions = ['d1', 'd2', 'd3', 'naia'];
        
        validDivisions.forEach(division => {
          expect(teamsService.isValidDivision(division)).toBe(true);
        });
      });

      it('should return false for invalid divisions', () => {
        const invalidDivisions = ['invalid-division', '', null, undefined];
        
        invalidDivisions.forEach(division => {
          expect(teamsService.isValidDivision(division)).toBe(false);
        });
      });
    });

    describe('isValidGender', () => {
      it('should return true for valid genders', () => {
        const validGenders = ['men', 'women', 'mixed'];
        
        validGenders.forEach(gender => {
          expect(teamsService.isValidGender(gender)).toBe(true);
        });
      });

      it('should return false for invalid genders', () => {
        const invalidGenders = ['invalid-gender', '', null, undefined];
        
        invalidGenders.forEach(gender => {
          expect(teamsService.isValidGender(gender)).toBe(false);
        });
      });
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle concurrent team operations', async () => {
      // Arrange
      const mockTeam = { id: 1, name: 'Test Team' };
      mockTeamsRepository.findOrCreate.mockResolvedValue(mockTeam);

      // Act - Simulate concurrent operations
      const promises = [
        teamsService.findOrCreateTeam(TeamBuilder.buildValidTeam()),
        teamsService.findOrCreateTeam(TeamBuilder.buildValidTeam({ name: 'Team B' })),
        teamsService.findOrCreateTeam(TeamBuilder.buildValidTeam({ name: 'Team C' }))
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      expect(mockTeamsRepository.findOrCreate).toHaveBeenCalledTimes(3);
    });

    it('should handle very large team datasets', async () => {
      // Arrange
      const largeTeamArray = Array(10000).fill().map((_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        sport: 'basketball'
      }));
      
      const mockResult = { teams: largeTeamArray, total: 10000, page: 1 };
      mockTeamsRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await teamsService.getTeams();

      // Assert
      expect(result.teams).toHaveLength(10000);
      expect(result.total).toBe(10000);
    });

    it('should handle malformed team data gracefully', async () => {
      // Arrange
      const malformedData = {
        name: 'Test Team',
        sport: 'basketball',
        division: 'd1',
        gender: 'men',
        extraField: 'should be ignored',
        nestedField: { invalid: 'structure' }
      };

      const mockTeam = { id: 1, name: 'Test Team', sport: 'basketball' };
      mockTeamsRepository.findOrCreate.mockResolvedValue(mockTeam);

      // Act
      const result = await teamsService.findOrCreateTeam(malformedData);

      // Assert
      expect(mockTeamsRepository.findOrCreate).toHaveBeenCalledWith(malformedData);
      expect(result).toEqual(mockTeam);
    });
  });
});

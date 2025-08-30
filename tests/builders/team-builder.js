/**
 * Team Builder
 * 
 * Test data builder for creating team objects used in testing the teams service.
 * Provides valid and invalid team data for various test scenarios.
 */

/**
 * Team Data Builder
 */
export class TeamBuilder {
  /**
   * Build a valid team with default values
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Valid team data
   */
  static buildValidTeam(overrides = {}) {
    return {
      team_id: 'team-123',
      name: 'Test Team',
      short_name: 'TEST',
      mascot: 'Lions',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      city: 'Test City',
      state: 'CA',
      country: 'USA',
      conference: 'Test Conference',
      colors: '#FF0000,#0000FF',
      founded_year: 1990,
      home_venue: 'Test Arena',
      capacity: 15000,
      website: 'https://testteam.edu',
      email: 'athletics@testteam.edu',
      phone: '(555) 123-4567',
      address: '123 Test Street',
      zip_code: '12345',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    };
  }

  /**
   * Build an invalid team with validation errors
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Invalid team data
   */
  static buildInvalidTeam(overrides = {}) {
    return {
      team_id: '', // Invalid: empty string
      name: '', // Invalid: empty string
      short_name: 'A'.repeat(21), // Too long short name
      mascot: 'A'.repeat(101), // Too long mascot
      sport: 'invalid-sport', // Invalid sport
      division: 'invalid-division', // Invalid division
      gender: 'invalid-gender', // Invalid gender
      city: 'A'.repeat(51), // Too long city name
      state: 'INVALID', // Invalid state
      country: 'INVALID', // Invalid country
      conference: 'A'.repeat(101), // Too long conference name
      colors: 'invalid-color', // Invalid color format
      founded_year: 'not-a-year', // Invalid year
      home_venue: 'A'.repeat(101), // Too long venue name
      capacity: 'not-a-number', // Invalid capacity
      website: 'not-a-url', // Invalid URL
      email: 'not-an-email', // Invalid email
      phone: 'not-a-phone', // Invalid phone
      address: 'A'.repeat(201), // Too long address
      zip_code: 'invalid-zip', // Invalid zip code
      ...overrides
    };
  }

  /**
   * Build a basketball team
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Basketball team data
   */
  static buildBasketballTeam(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a football team
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Football team data
   */
  static buildFootballTeam(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      sport: 'football',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a baseball team
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Baseball team data
   */
  static buildBaseballTeam(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      sport: 'baseball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a women's team
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Women's team data
   */
  static buildWomensTeam(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      gender: 'women',
      ...overrides
    };
  }

  /**
   * Build a D2 team
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} D2 team data
   */
  static buildD2Team(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      division: 'd2',
      ...overrides
    };
  }

  /**
   * Build a D3 team
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} D3 team data
   */
  static buildD3Team(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      division: 'd3',
      ...overrides
    };
  }

  /**
   * Build a team with minimal required fields
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Minimal team data
   */
  static buildMinimalTeam(overrides = {}) {
    return {
      name: 'Test Team',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a team with extended metadata
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Team data with extended metadata
   */
  static buildTeamWithMetadata(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      social_media: {
        twitter: '@testteam',
        instagram: '@testteam_official',
        facebook: 'testteamathletics'
      },
      sponsors: ['Nike', 'Gatorade', 'Under Armour'],
      achievements: [
        'Conference Champions 2023',
        'NCAA Tournament 2022',
        'Academic Excellence Award 2023'
      ],
      facilities: {
        practice_gym: 'Practice Facility A',
        weight_room: 'Strength & Conditioning Center',
        training_room: 'Sports Medicine Center'
      },
      ...overrides
    };
  }

  /**
   * Build a team for update operations
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Team data for updates
   */
  static buildTeamForUpdate(overrides = {}) {
    return {
      name: 'Updated Team Name',
      mascot: 'Updated Mascot',
      colors: '#00FF00,#FFFF00',
      capacity: 20000,
      notes: 'Team information updated',
      ...overrides
    };
  }

  /**
   * Build multiple teams for batch testing
   * @param {number} count - Number of teams to create
   * @param {Object} baseOverrides - Base overrides for all teams
   * @param {Function} customizer - Function to customize each team
   * @returns {Array} Array of team data
   */
  static buildMultipleTeams(count = 3, baseOverrides = {}, customizer = null) {
    const teams = [];
    
    for (let i = 0; i < count; i++) {
      let team = this.buildValidTeam({
        team_id: `team-${i + 1}`,
        name: `Test Team ${i + 1}`,
        short_name: `TT${i + 1}`,
        city: `City ${i + 1}`,
        ...baseOverrides
      });
      
      if (customizer && typeof customizer === 'function') {
        team = customizer(team, i);
      }
      
      teams.push(team);
    }
    
    return teams;
  }

  /**
   * Build a team with specific validation errors
   * @param {Array} errorTypes - Types of validation errors to include
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Team data with specific validation errors
   */
  static buildTeamWithValidationErrors(errorTypes = [], overrides = {}) {
    const team = this.buildValidTeam();
    
    errorTypes.forEach(errorType => {
      switch (errorType) {
        case 'missing_name':
          team.name = '';
          break;
        case 'missing_sport':
          team.sport = '';
          break;
        case 'missing_division':
          team.division = '';
          break;
        case 'missing_gender':
          team.gender = '';
          break;
        case 'invalid_sport':
          team.sport = 'invalid-sport';
          break;
        case 'invalid_division':
          team.division = 'invalid-division';
          break;
        case 'invalid_gender':
          team.gender = 'invalid-gender';
          break;
        case 'long_name':
          team.name = 'A'.repeat(101);
          break;
        case 'long_short_name':
          team.short_name = 'A'.repeat(21);
          break;
        case 'long_mascot':
          team.mascot = 'A'.repeat(101);
          break;
        case 'long_city':
          team.city = 'A'.repeat(51);
          break;
        case 'long_conference':
          team.conference = 'A'.repeat(101);
          break;
        case 'invalid_state':
          team.state = 'INVALID';
          break;
        case 'invalid_country':
          team.country = 'INVALID';
          break;
        case 'invalid_colors':
          team.colors = ['invalid-color'];
          break;
        case 'invalid_year':
          team.founded_year = 'not-a-year';
          break;
        case 'invalid_capacity':
          team.capacity = 'not-a-number';
          break;
        case 'invalid_website':
          team.website = 'not-a-url';
          break;
        case 'invalid_email':
          team.email = 'not-an-email';
          break;
        case 'invalid_phone':
          team.phone = 'not-a-phone';
          break;
        case 'long_address':
          team.address = 'A'.repeat(201);
          break;
        case 'invalid_zip':
          team.zip_code = 'invalid-zip';
          break;
      }
    });
    
    return { ...team, ...overrides };
  }

  /**
   * Build a team with conference information
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Team data with conference information
   */
  static buildTeamWithConference(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      conference_id: 'conf-1',
      conference: {
        id: 'conf-1',
        name: 'Test Conference',
        short_name: 'TEST',
        level: 'd1',
        region: 'West',
        country: 'USA'
      },
      ...overrides
    };
  }

  /**
   * Build a team with venue information
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Team data with venue information
   */
  static buildTeamWithVenue(overrides = {}) {
    return {
      ...this.buildValidTeam(),
      venue_id: 'venue-1',
      home_venue: 'Test Arena',
      venue: {
        id: 'venue-1',
        name: 'Test Arena',
        city: 'Test City',
        state: 'CA',
        country: 'USA',
        capacity: 20000
      },
      ...overrides
    };
  }

  /**
   * Build a team for NCAA ingestion
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Team data for NCAA ingestion
   */
  static buildTeamForNCAAIngestion(overrides = {}) {
    return {
      name: 'Test Team',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      conference: 'Test Conference',
      ...overrides
    };
  }
}

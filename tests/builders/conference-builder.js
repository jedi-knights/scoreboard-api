/**
 * Conference Builder
 * 
 * Test data builder for creating conference objects used in testing the conferences service.
 * Provides valid and invalid conference data for various test scenarios.
 */

/**
 * Conference Data Builder
 */
export class ConferenceBuilder {
  /**
   * Build a valid conference with default values
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Valid conference data
   */
  static buildValidConference(overrides = {}) {
    return {
      conference_id: 'conf-123',
      name: 'Test Conference',
      short_name: 'TEST',
      level: 'd1',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      region: 'West',
      country: 'USA',
      founded_year: 1950,
      headquarters: 'Test City, CA',
      commissioner: 'John Commissioner',
      website: 'https://testconference.org',
      email: 'info@testconference.org',
      phone: '(555) 987-6543',
      address: '456 Conference Blvd',
      city: 'Test City',
      state: 'CA',
      zip_code: '54321',
      colors: '#FF0000,#0000FF',
      logo_url: 'https://testconference.org/logo.png',
      member_count: 12,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    };
  }

  /**
   * Build an invalid conference with validation errors
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Invalid conference data
   */
  static buildInvalidConference(overrides = {}) {
    return {
      conference_id: '', // Invalid: empty string
      name: '', // Invalid: empty string
      short_name: 'A'.repeat(21), // Too long short name
      level: 'invalid-level', // Invalid level
      sport: 'invalid-sport', // Invalid sport
      division: 'invalid-division', // Invalid division
      gender: 'invalid-gender', // Invalid gender
      region: 'A'.repeat(51), // Too long region name
      country: 'INVALID', // Invalid country
      founded_year: 'not-a-year', // Invalid year
      headquarters: 'A'.repeat(101), // Too long headquarters
      commissioner: 'A'.repeat(101), // Too long commissioner name
      website: 'not-a-url', // Invalid URL
      email: 'not-an-email', // Invalid email
      phone: 'not-a-phone', // Invalid phone
      address: 'A'.repeat(201), // Too long address
      city: 'A'.repeat(51), // Too long city name
      state: 'INVALID', // Invalid state
      zip_code: 'invalid-zip', // Invalid zip code
      colors: ['invalid-color'], // Invalid color format
      logo_url: 'not-a-url', // Invalid URL
      member_count: 'not-a-number', // Invalid member count
      ...overrides
    };
  }

  /**
   * Build a basketball conference
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Basketball conference data
   */
  static buildBasketballConference(overrides = {}) {
    return {
      ...this.buildValidConference(),
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a football conference
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Football conference data
   */
  static buildFootballConference(overrides = {}) {
    return {
      ...this.buildValidConference(),
      sport: 'football',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a baseball conference
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Baseball conference data
   */
  static buildBaseballConference(overrides = {}) {
    return {
      ...this.buildValidConference(),
      sport: 'baseball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a women's conference
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Women's conference data
   */
  static buildWomensConference(overrides = {}) {
    return {
      ...this.buildValidConference(),
      gender: 'women',
      ...overrides
    };
  }

  /**
   * Build a D2 conference
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} D2 conference data
   */
  static buildD2Conference(overrides = {}) {
    return {
      ...this.buildValidConference(),
      level: 'd2',
      division: 'd2',
      ...overrides
    };
  }

  /**
   * Build a D3 conference
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} D3 conference data
   */
  static buildD3Conference(overrides = {}) {
    return {
      ...this.buildValidConference(),
      level: 'd3',
      division: 'd3',
      ...overrides
    };
  }

  /**
   * Build a conference with minimal required fields
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Minimal conference data
   */
  static buildMinimalConference(overrides = {}) {
    return {
      name: 'Test Conference',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }

  /**
   * Build a conference with extended metadata
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Conference data with extended metadata
   */
  static buildConferenceWithMetadata(overrides = {}) {
    return {
      ...this.buildValidConference(),
      social_media: {
        twitter: '@testconference',
        instagram: '@testconference_official',
        facebook: 'testconference'
      },
      sponsors: ['Nike', 'ESPN', 'Coca-Cola'],
      achievements: [
        'Most NCAA Championships',
        'Academic Excellence Award 2023',
        'Community Service Award 2023'
      ],
      facilities: {
        headquarters: 'Conference Center',
        media_center: 'Broadcast Facility',
        training_center: 'Athlete Development Center'
      },
      media_rights: {
        primary_broadcaster: 'ESPN',
        streaming_partner: 'ESPN+',
        radio_partner: 'SiriusXM'
      },
      ...overrides
    };
  }

  /**
   * Build a conference for update operations
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Conference data for updates
   */
  static buildConferenceForUpdate(overrides = {}) {
    return {
      name: 'Updated Conference Name',
      short_name: 'UPD',
      commissioner: 'Jane Commissioner',
      colors: '#00FF00,#FFFF00',
      member_count: 14,
      notes: 'Conference information updated',
      ...overrides
    };
  }

  /**
   * Build multiple conferences for batch testing
   * @param {number} count - Number of conferences to create
   * @param {Object} baseOverrides - Base overrides for all conferences
   * @param {Function} customizer - Function to customize each conference
   * @returns {Array} Array of conference data
   */
  static buildMultipleConferences(count = 3, baseOverrides = {}, customizer = null) {
    const conferences = [];
    
    for (let i = 0; i < count; i++) {
      let conference = this.buildValidConference({
        conference_id: `conf-${i + 1}`,
        name: `Test Conference ${i + 1}`,
        short_name: `TC${i + 1}`,
        city: `City ${i + 1}`,
        ...baseOverrides
      });
      
      if (customizer && typeof customizer === 'function') {
        conference = customizer(conference, i);
      }
      
      conferences.push(conference);
    }
    
    return conferences;
  }

  /**
   * Build a conference with specific validation errors
   * @param {Array} errorTypes - Types of validation errors to include
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Conference data with specific validation errors
   */
  static buildConferenceWithValidationErrors(errorTypes = [], overrides = {}) {
    const conference = this.buildValidConference();
    
    errorTypes.forEach(errorType => {
      switch (errorType) {
        case 'missing_name':
          conference.name = '';
          break;
        case 'missing_sport':
          conference.sport = '';
          break;
        case 'missing_division':
          conference.division = '';
          break;
        case 'missing_gender':
          conference.gender = '';
          break;
        case 'invalid_sport':
          conference.sport = 'invalid-sport';
          break;
        case 'invalid_division':
          conference.division = 'invalid-division';
          break;
        case 'invalid_gender':
          conference.gender = 'invalid-gender';
          break;
        case 'invalid_level':
          conference.level = 'invalid-level';
          break;
        case 'long_name':
          conference.name = 'A'.repeat(101);
          break;
        case 'long_short_name':
          conference.short_name = 'A'.repeat(21);
          break;
        case 'long_region':
          conference.region = 'A'.repeat(51);
          break;
        case 'long_headquarters':
          conference.headquarters = 'A'.repeat(101);
          break;
        case 'long_commissioner':
          conference.commissioner = 'A'.repeat(101);
          break;
        case 'long_city':
          conference.city = 'A'.repeat(51);
          break;
        case 'invalid_state':
          conference.state = 'INVALID';
          break;
        case 'invalid_country':
          conference.country = 'INVALID';
          break;
        case 'invalid_colors':
          conference.colors = 'invalid-color';
          break;
        case 'invalid_year':
          conference.founded_year = 'not-a-year';
          break;
        case 'invalid_member_count':
          conference.member_count = 'not-a-number';
          break;
        case 'invalid_website':
          conference.website = 'not-a-url';
          break;
        case 'invalid_email':
          conference.email = 'not-an-email';
          break;
        case 'invalid_phone':
          conference.phone = 'not-a-phone';
          break;
        case 'long_address':
          conference.address = 'A'.repeat(201);
          break;
        case 'invalid_zip':
          conference.zip_code = 'invalid-zip';
          break;
        case 'invalid_logo_url':
          conference.logo_url = 'not-a-url';
          break;
      }
    });
    
    return { ...conference, ...overrides };
  }

  /**
   * Build a conference with member teams
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Conference data with member teams
   */
  static buildConferenceWithTeams(overrides = {}) {
    return {
      ...this.buildValidConference(),
      member_teams: [
        {
          team_id: 'team-1',
          name: 'Team A',
          short_name: 'TA',
          city: 'City A',
          state: 'CA'
        },
        {
          team_id: 'team-2',
          name: 'Team B',
          short_name: 'TB',
          city: 'City B',
          state: 'NY'
        }
      ],
      ...overrides
    };
  }

  /**
   * Build a conference for NCAA ingestion
   * @param {Object} overrides - Custom values to override defaults
   * @returns {Object} Conference data for NCAA ingestion
   */
  static buildConferenceForNCAAIngestion(overrides = {}) {
    return {
      name: 'Test Conference',
      sport: 'basketball',
      division: 'd1',
      gender: 'men',
      ...overrides
    };
  }
}

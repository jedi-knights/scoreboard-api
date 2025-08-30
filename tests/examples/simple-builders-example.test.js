/**
 * Simple Test Data Builders Example
 * 
 * This test demonstrates the test data builders without complex mock setup.
 */

import { jest } from '@jest/globals';
import { GameBuilder } from '../builders/game-builder.js';
import { TeamBuilder } from '../builders/team-builder.js';
import { ConferenceBuilder } from '../builders/conference-builder.js';
import { NCAAGameBuilder } from '../builders/ncaa-game-builder.js';

describe('Simple Test Data Builders Example', () => {
  describe('Game Builder', () => {
    it('should build valid games with different sports', () => {
      // Use imported builders directly
      
      const basketballGame = GameBuilder.buildBasketballGame();
      const footballGame = GameBuilder.buildFootballGame();
      const baseballGame = GameBuilder.buildBaseballGame();

      expect(basketballGame.sport).toBe('basketball');
      expect(footballGame.sport).toBe('football');
      expect(baseballGame.sport).toBe('baseball');
    });

    it('should build games with different statuses', () => {
      const scheduledGame = GameBuilder.buildScheduledGame();
      const liveGame = GameBuilder.buildLiveGame();
      const completedGame = GameBuilder.buildCompletedGame();

      expect(scheduledGame.status).toBe('scheduled');
      expect(liveGame.status).toBe('live');
      expect(completedGame.status).toBe('final');
      expect(liveGame.current_period).toBe(2);
      expect(completedGame.home_score).toBe(85);
    });

    it('should build games with validation errors', () => {
      const invalidGame = GameBuilder.buildGameWithValidationErrors([
        'missing_home_team',
        'invalid_sport',
        'invalid_date'
      ]);

      expect(invalidGame.home_team).toBe('');
      expect(invalidGame.sport).toBe('invalid-sport');
      expect(invalidGame.date).toBe('invalid-date');
    });

    it('should build multiple games for batch testing', () => {
      const games = GameBuilder.buildMultipleGames(3, 
        { sport: 'basketball' },
        (game, index) => {
          game.date = `2024-01-${String(index + 1).padStart(2, '0')}`;
          return game;
        }
      );

      expect(games).toHaveLength(3);
      expect(games[0].date).toBe('2024-01-01');
      expect(games[1].date).toBe('2024-01-02');
      expect(games[2].date).toBe('2024-01-03');
    });
  });

  describe('Team Builder', () => {
    it('should build valid teams with different sports', () => {
      const basketballTeam = TeamBuilder.buildBasketballTeam();
      const footballTeam = TeamBuilder.buildFootballTeam();
      const baseballTeam = TeamBuilder.buildBaseballTeam();

      expect(basketballTeam.sport).toBe('basketball');
      expect(footballTeam.sport).toBe('football');
      expect(baseballTeam.sport).toBe('baseball');
    });

    it('should build teams with different divisions', () => {
      const d1Team = TeamBuilder.buildValidTeam({ division: 'd1' });
      const d2Team = TeamBuilder.buildD2Team();
      const d3Team = TeamBuilder.buildD3Team();

      expect(d1Team.division).toBe('d1');
      expect(d2Team.division).toBe('d2');
      expect(d3Team.division).toBe('d3');
    });

    it('should build teams with validation errors', () => {
      const invalidTeam = TeamBuilder.buildTeamWithValidationErrors([
        'missing_name',
        'invalid_sport'
      ]);

      expect(invalidTeam.name).toBe('');
      expect(invalidTeam.sport).toBe('invalid-sport');
    });

    it('should build teams with extended metadata', () => {
      const teamWithMetadata = TeamBuilder.buildTeamWithMetadata();

      expect(teamWithMetadata.social_media).toBeDefined();
      expect(teamWithMetadata.sponsors).toBeDefined();
      expect(teamWithMetadata.achievements).toBeDefined();
      expect(teamWithMetadata.facilities).toBeDefined();
    });
  });

  describe('Conference Builder', () => {
    it('should build valid conferences with different sports', () => {
      const basketballConf = ConferenceBuilder.buildBasketballConference();
      const footballConf = ConferenceBuilder.buildFootballConference();
      const baseballConf = ConferenceBuilder.buildBaseballConference();

      expect(basketballConf.sport).toBe('basketball');
      expect(footballConf.sport).toBe('football');
      expect(baseballConf.sport).toBe('baseball');
    });

    it('should build conferences with different levels', () => {
      const d1Conf = ConferenceBuilder.buildValidConference({ level: 'd1' });
      const d2Conf = ConferenceBuilder.buildD2Conference();
      const d3Conf = ConferenceBuilder.buildD3Conference();

      expect(d1Conf.level).toBe('d1');
      expect(d2Conf.level).toBe('d2');
      expect(d3Conf.level).toBe('d3');
    });

    it('should build conferences with member teams', () => {
      const confWithTeams = ConferenceBuilder.buildConferenceWithTeams();

      expect(confWithTeams.member_teams).toBeDefined();
      expect(confWithTeams.member_teams).toHaveLength(2);
      expect(confWithTeams.member_teams[0].team_id).toBe('team-1');
    });
  });

  describe('NCAA Game Builder', () => {
    it('should build games for different sports with sport-specific data', () => {
      const basketballGame = NCAAGameBuilder.buildGameForSport('basketball');
      const footballGame = NCAAGameBuilder.buildGameForSport('football');
      const baseballGame = NCAAGameBuilder.buildGameForSport('baseball');

      expect(basketballGame.periods).toBe(4);
      expect(basketballGame.period_length).toBe('20:00');
      expect(footballGame.periods).toBe(4);
      expect(footballGame.period_length).toBe('15:00');
      expect(baseballGame.period_length).toBe('unlimited');
    });

    it('should build games with different statuses and appropriate data', () => {
      const scheduledGame = NCAAGameBuilder.buildGameWithStatus('scheduled');
      const liveGame = NCAAGameBuilder.buildGameWithStatus('live');
      const finalGame = NCAAGameBuilder.buildGameWithStatus('final');

      expect(scheduledGame.home_score).toBeNull();
      expect(liveGame.current_period).toBe(2);
      expect(liveGame.time_remaining).toBe('15:30');
      expect(finalGame.current_period).toBe(4);
      expect(finalGame.time_remaining).toBe('00:00');
    });

    it('should build games for different divisions with division-specific data', () => {
      const d1Game = NCAAGameBuilder.buildGameForDivision('d1');
      const d2Game = NCAAGameBuilder.buildGameForDivision('d2');
      const d3Game = NCAAGameBuilder.buildGameForDivision('d3');

      expect(d1Game.scholarship_limit).toBe(85);
      expect(d1Game.competition_level).toBe('highest');
      expect(d2Game.scholarship_limit).toBe(36);
      expect(d3Game.scholarship_limit).toBe(0);
    });

    it('should build games for different genders with gender-specific data', () => {
      const mensGame = NCAAGameBuilder.buildGameForGender('men');
      const womensGame = NCAAGameBuilder.buildGameForGender('women');
      const coedGame = NCAAGameBuilder.buildGameForGender('coed');

      expect(mensGame.gender_category).toBe('male');
      expect(womensGame.gender_category).toBe('female');
      expect(coedGame.gender_category).toBe('mixed');
    });
  });

  describe('Advanced Testing Patterns', () => {
    it('should demonstrate complex test data building with customizers', () => {
      const customizer = (game, index) => {
        game.home_team = `Home Team ${index + 1}`;
        game.away_team = `Away Team ${index + 1}`;
        game.date = `2024-01-${String(index + 1).padStart(2, '0')}`;
        game.venue = `Venue ${index + 1}`;
        return game;
      };

      const games = GameBuilder.buildMultipleGames(3, {}, customizer);

      expect(games).toHaveLength(3);
      expect(games[0].home_team).toBe('Home Team 1');
      expect(games[1].away_team).toBe('Away Team 2');
      expect(games[2].venue).toBe('Venue 3');
    });

    it('should demonstrate validation error combinations', () => {
      const errorTypes = [
        'missing_home_team',
        'invalid_sport',
        'invalid_date'
      ];

      const invalidGame = GameBuilder.buildGameWithValidationErrors(errorTypes);

      expect(invalidGame.home_team).toBe('');
      expect(invalidGame.sport).toBe('invalid-sport');
      expect(invalidGame.date).toBe('invalid-date');
    });
  });
});

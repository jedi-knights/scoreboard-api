import express from 'express';
import { GamesController } from '../controllers/games-controller.js';

/**
 * Games Routes
 * 
 * Defines all games-related API endpoints.
 * Implements RESTful routing patterns.
 */
export function createGamesRoutes(databaseAdapter) {
  const router = express.Router();
  const gamesController = new GamesController(databaseAdapter);

  // GET /api/games - List all games with filters and pagination
  router.get('/', gamesController.getGames.bind(gamesController));

  // GET /api/games/live - Get live games (in progress)
  router.get('/live', gamesController.getLiveGames.bind(gamesController));

  // GET /api/games/statistics - Get game statistics
  router.get('/statistics', gamesController.getGameStatistics.bind(gamesController));

  // GET /api/games/date-range - Get games by date range
  router.get('/date-range', gamesController.getGamesByDateRange.bind(gamesController));

  // GET /api/games/team/:teamName - Get games by team
  router.get('/team/:teamName', gamesController.getGamesByTeam.bind(gamesController));

  // GET /api/games/:id - Get a specific game by ID
  router.get('/:id', gamesController.getGameById.bind(gamesController));

  // POST /api/games - Create a new game
  router.post('/', gamesController.createGame.bind(gamesController));

  // PUT /api/games/:id - Update an existing game
  router.put('/:id', gamesController.updateGame.bind(gamesController));

  // DELETE /api/games/:id - Delete a game
  router.delete('/:id', gamesController.deleteGame.bind(gamesController));

  return router;
}


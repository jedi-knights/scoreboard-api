import express from 'express';

/**
 * NCAA Ingestion Routes
 *
 * Defines all NCAA ingestion-related API endpoints.
 * These routes handle posting game records from the NCAA scoreboard application.
 */
export function createNCAAIngestionRoutes (container) {
  const router = express.Router();
  const ncaaIngestionController = container.resolve('ncaaIngestionController');

  /**
   * @swagger
   * /api/v1/ncaa/ingest/health:
   *   get:
   *     summary: NCAA Ingestion Service Health Check
   *     description: Check the health status of the NCAA ingestion service
   *     tags: [NCAA Ingestion]
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       500:
   *         description: Service health check failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/health', ncaaIngestionController.getHealth.bind(ncaaIngestionController));

  /**
   * @swagger
   * /api/v1/ncaa/ingest/validate:
   *   post:
   *     summary: Validate NCAA Game Data
   *     description: Validate NCAA game data without ingesting it into the system
   *     tags: [NCAA Ingestion]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NCAAGameData'
   *     responses:
   *       200:
   *         description: Game data is valid
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Game data validation successful
   *                 data:
   *                   type: object
   *                   properties:
   *                     game_id:
   *                       type: string
   *                       example: duke-unc-basketball-2024-01-15
   *       400:
   *         description: Game data validation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/validate', ncaaIngestionController.validateGameData.bind(ncaaIngestionController));

  /**
   * @swagger
   * /api/v1/ncaa/ingest/game:
   *   post:
   *     summary: Ingest Single NCAA Game
   *     description: Ingest a single NCAA game record into the system
   *     tags: [NCAA Ingestion]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NCAAGameData'
   *     responses:
   *       201:
   *         description: Game successfully ingested
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Game successfully ingested
   *                 data:
   *                   type: object
   *                   properties:
   *                     game_id:
   *                       type: string
   *                       example: duke-unc-basketball-2024-01-15
   *                     action:
   *                       type: string
   *                       enum: [created, skipped]
   *                       example: created
   *                     entities_created:
   *                       type: object
   *                       properties:
   *                         teams:
   *                           type: integer
   *                           example: 2
   *                         conferences:
   *                           type: integer
   *                           example: 1
   *       200:
   *         description: Game already exists (skipped)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Game was already ingested previously
   *                 data:
   *                   type: object
   *                   properties:
   *                     game_id:
   *                       type: string
   *                       example: duke-unc-basketball-2024-01-15
   *                     action:
   *                       type: string
   *                       enum: [created, skipped]
   *                       example: skipped
   *                     reason:
   *                       type: string
   *                       example: Game already exists
   *       400:
   *         description: Invalid game data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/game', ncaaIngestionController.ingestGame.bind(ncaaIngestionController));

  /**
   * @swagger
   * /api/v1/ncaa/ingest/games:
   *   post:
   *     summary: Ingest Multiple NCAA Games (Batch)
   *     description: Ingest multiple NCAA game records in a single request
   *     tags: [NCAA Ingestion]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               $ref: '#/components/schemas/NCAAGameData'
   *             maxItems: 100
   *             example:
   *               - home_team: "Duke Blue Devils"
   *                 away_team: "North Carolina Tar Heels"
   *                 sport: "basketball"
   *                 division: "d1"
   *                 date: "2024-01-15"
   *                 time: "19:00"
   *                 venue: "Cameron Indoor Stadium"
   *     responses:
   *       200:
   *         description: Batch ingestion completed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Batch ingestion completed
   *                 data:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 10
   *                     successful:
   *                       type: integer
   *                       example: 8
   *                     failed:
   *                       type: integer
   *                       example: 1
   *                     skipped:
   *                       type: integer
   *                       example: 1
   *                     details:
   *                       type: array
   *                       items:
   *                         type: string
   *       400:
   *         description: Invalid request or batch size exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/games', ncaaIngestionController.ingestGames.bind(ncaaIngestionController));

  return router;
}

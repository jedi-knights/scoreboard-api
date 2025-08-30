import { GamesService } from './services/games-service.js';
import { NCAAIngestionService } from './services/ncaa-ingestion-service.js';
import { ConferencesService } from './services/conferences-service.js';
import { TeamsService } from './services/teams-service.js';
import { GamesController } from './controllers/games-controller.js';
import { NCAAIngestionController } from './controllers/ncaa-ingestion-controller.js';
import { GamesRepository } from './database/repositories/games-repository.js';
import { TeamsRepository } from './database/repositories/teams-repository.js';
import { ConferencesRepository } from './database/repositories/conferences-repository.js';
import { createTransactionManager } from './utils/transaction-manager.js';

/**
 * Dependency Injection Container
 *
 * Manages service instances and provides dependency injection capabilities.
 * This makes the application more testable by allowing services to be easily mocked.
 */
export class Container {
  constructor () {
    this.services = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a service factory function
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service instance
   * @param {boolean} singleton - Whether the service should be a singleton
   */
  register (name, factory, singleton = true) {
    this.services.set(name, { factory, singleton });
  }

  /**
   * Resolve a service instance
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  resolve (name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not registered`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory());
      }
      return this.singletons.get(name);
    } else {
      return service.factory();
    }
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean} Whether the service is registered
   */
  has (name) {
    return this.services.has(name);
  }

  /**
   * Clear all registered services and singletons
   */
  clear () {
    this.services.clear();
    this.singletons.clear();
  }
}

/**
 * Create and configure the application container with all services
 * @param {Object} databaseAdapter - Database adapter instance
 * @returns {Container} Configured container
 */
export function createContainer (databaseAdapter) {
  const container = new Container();

  // Register repositories
  container.register('gamesRepository', () => new GamesRepository(databaseAdapter));
  container.register('teamsRepository', () => new TeamsRepository(databaseAdapter));
  container.register('conferencesRepository', () => new ConferencesRepository(databaseAdapter));

  // Register transaction manager
  container.register('transactionManager', () => createTransactionManager(databaseAdapter));

  // Register services with their dependencies
  container.register('gamesService', () => {
    const gamesRepository = container.resolve('gamesRepository');
    return new GamesService(gamesRepository, databaseAdapter);
  });

  container.register('teamsService', () => {
    const teamsRepository = container.resolve('teamsRepository');
    return new TeamsService(teamsRepository, databaseAdapter);
  });

  container.register('conferencesService', () => {
    const conferencesRepository = container.resolve('conferencesRepository');
    return new ConferencesService(conferencesRepository, databaseAdapter);
  });

  // Register services that depend on other services
  container.register('ncaaIngestionService', () => {
    const gamesService = container.resolve('gamesService');
    const teamsService = container.resolve('teamsService');
    const conferencesService = container.resolve('conferencesService');
    return new NCAAIngestionService(gamesService, teamsService, conferencesService);
  });

  // Register controllers with their service dependencies
  container.register('gamesController', () => {
    const gamesService = container.resolve('gamesService');
    return new GamesController(gamesService);
  });

  container.register('ncaaIngestionController', () => {
    const ncaaIngestionService = container.resolve('ncaaIngestionService');
    return new NCAAIngestionController(ncaaIngestionService);
  });

  return container;
}

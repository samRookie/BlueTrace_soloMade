import {
  db,
  type AppDatabase,
  getEntityCounts,
  checkDatabaseHealth,
  type EntityCounts,
  type DatabaseHealthStatus,
} from '@sih26019/db';

export class ResourceRepository {
  constructor(private readonly database: AppDatabase = db) {}

  /**
   * Retrieves aggregate record counts across all persistent domain tables.
   */
  async getCounts(): Promise<EntityCounts> {
    return getEntityCounts(this.database);
  }

  /**
   * Checks database connectivity health status.
   */
  async checkHealth(): Promise<DatabaseHealthStatus> {
    return checkDatabaseHealth(this.database);
  }
}

export const defaultResourceRepository = new ResourceRepository();

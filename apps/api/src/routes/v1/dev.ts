import { Router, type Request, type Response } from 'express';
import { ARCHITECTURE_VERSION } from '@sih26019/shared-types';
import { checkDatabaseHealth, getEntityCounts } from '@sih26019/db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response.js';

export const devRouter: Router = Router();

/**
 * GET /api/v1/dev/data-status
 * Development-only diagnostic route exposing database connectivity, sample data status, and entity counts.
 */
devRouter.get('/data-status', async (_req: Request, res: Response) => {
  // Security guard: Disable diagnostic inspection in production
  if (process.env.NODE_ENV === 'production') {
    res
      .status(403)
      .json(
        createErrorResponse(
          'FORBIDDEN',
          'Diagnostic data-status endpoints are disabled in production.',
        ),
      );
    return;
  }

  try {
    const health = await checkDatabaseHealth();
    let counts = null;
    let sampleDataSeeded = false;

    if (health.connected) {
      counts = await getEntityCounts();
      sampleDataSeeded =
        counts.projects > 0 && counts.regions > 0 && counts.evidenceRelationships > 0;
    }

    res.status(200).json(
      createSuccessResponse({
        database: {
          connected: health.connected,
          status: health.connected ? 'connected' : 'unreachable',
        },
        sampleDataSeeded,
        counts: counts || {
          sources: 0,
          regions: 0,
          workspaces: 0,
          policies: 0,
          indicators: 0,
          gisLayers: 0,
          projects: 0,
          innovationOpportunities: 0,
          blueCarbonProjects: 0,
          mrvRecords: 0,
          verificationRecords: 0,
          integrityRecords: 0,
          disputes: 0,
          evidenceItems: 0,
          evidenceRelationships: 0,
        },
        architectureVersion: ARCHITECTURE_VERSION,
        environment: process.env.NODE_ENV || 'development',
      }),
    );
  } catch (error) {
    res
      .status(500)
      .json(
        createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to query database data status.',
          error instanceof Error ? error.message : undefined,
        ),
      );
  }
});

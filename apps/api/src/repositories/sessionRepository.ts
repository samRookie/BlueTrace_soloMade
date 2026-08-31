import { eq, and, gt, isNull } from 'drizzle-orm';
import {
  db,
  schema,
  type AppDatabase,
  type SessionRow,
  type InsertSessionRow,
  type UserRow,
} from '@sih26019/db';

export interface SessionWithUser extends SessionRow {
  user: UserRow;
}

export class SessionRepository {
  constructor(private readonly database: AppDatabase = db) {}

  async create(sessionData: InsertSessionRow): Promise<SessionRow> {
    const rows = await this.database.insert(schema.sessions).values(sessionData).returning();

    const created = rows[0];
    if (!created) {
      throw new Error('Failed to create session.');
    }
    return created;
  }

  async findByTokenHash(sessionTokenHash: string): Promise<SessionWithUser | null> {
    const now = new Date();

    const rows = await this.database
      .select({
        session: schema.sessions,
        user: schema.users,
      })
      .from(schema.sessions)
      .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(
        and(
          eq(schema.sessions.sessionTokenHash, sessionTokenHash),
          isNull(schema.sessions.revokedAt),
          gt(schema.sessions.expiresAt, now),
        ),
      )
      .limit(1);

    const match = rows[0];
    if (!match) {
      return null;
    }

    return {
      ...match.session,
      user: match.user,
    };
  }

  async revoke(id: string): Promise<void> {
    await this.database
      .update(schema.sessions)
      .set({ revokedAt: new Date() })
      .where(eq(schema.sessions.id, id));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.database
      .update(schema.sessions)
      .set({ revokedAt: new Date() })
      .where(eq(schema.sessions.userId, userId));
  }
}

export const defaultSessionRepository = new SessionRepository();

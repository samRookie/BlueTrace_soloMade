import { eq } from 'drizzle-orm';
import { db, schema, type AppDatabase, type UserRow, type InsertUserRow } from '@sih26019/db';

export class UserRepository {
  constructor(private readonly database: AppDatabase = db) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const normalized = email.trim().toLowerCase();
    const rows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, normalized))
      .limit(1);

    return rows[0] || null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const rows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return rows[0] || null;
  }

  async create(user: InsertUserRow): Promise<UserRow> {
    const normalizedEmail = user.email.trim().toLowerCase();
    const rows = await this.database
      .insert(schema.users)
      .values({
        ...user,
        email: normalizedEmail,
      })
      .returning();

    const created = rows[0];
    if (!created) {
      throw new Error('Failed to create user record.');
    }
    return created;
  }
}

export const defaultUserRepository = new UserRepository();

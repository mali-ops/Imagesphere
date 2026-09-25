import { db, isDatabaseConfigured } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName: fullName || email.split('@')[0],
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(fullName ? { fullName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.warn('Database user registration/fetch skipped:', (error as any).message);
    return null;
  }
}

export async function getAllUsers() {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.select().from(users);
  } catch (error) {
    console.warn('Database fetch users skipped:', (error as any).message);
    return [];
  }
}

export async function getUserByUid(uid: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.warn('Database fetch user by uid skipped:', (error as any).message);
    return null;
  }
}

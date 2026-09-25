import { db, isDatabaseConfigured } from './index.ts';
import { images } from './schema.ts';
import { eq, desc, or } from 'drizzle-orm';

export interface CreateImageInput {
  id: string;
  userId: string;
  title: string;
  slug?: string;
  description?: string;
  storageUrl: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  mimeType?: string;
  visibility?: string;
  tags?: string;
  storageProvider?: string;
}

export async function insertImageRecord(input: CreateImageInput) {
  if (!isDatabaseConfigured) return null;
  try {
    const result = await db
      .insert(images)
      .values(input)
      .onConflictDoUpdate({
        target: images.id,
        set: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          storageUrl: input.storageUrl,
          thumbnailUrl: input.thumbnailUrl,
          size: input.size,
          width: input.width,
          height: input.height,
          mimeType: input.mimeType,
          visibility: input.visibility,
          tags: input.tags,
          storageProvider: input.storageProvider,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.warn('Database insert/upsert image skipped:', (error as any).message);
    return null;
  }
}

export async function getImagesByUser(userId: string) {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.select().from(images).where(eq(images.userId, userId)).orderBy(desc(images.createdAt));
  } catch (error) {
    console.warn('Database get user images skipped:', (error as any).message);
    return [];
  }
}

export async function getAllPublicImages() {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.select().from(images).where(eq(images.visibility, 'public')).orderBy(desc(images.createdAt));
  } catch (error) {
    console.warn('Database get public images skipped:', (error as any).message);
    return [];
  }
}

export async function getImageById(id: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const res = await db.select().from(images).where(eq(images.id, id));
    return res[0] || null;
  } catch (error) {
    console.warn('Database get image by id skipped:', (error as any).message);
    return null;
  }
}

export async function getImageBySlugOrId(identifier: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const res = await db
      .select()
      .from(images)
      .where(or(eq(images.slug, identifier), eq(images.id, identifier)));
    return res[0] || null;
  } catch (error) {
    console.warn('Database get image by slug or id skipped:', (error as any).message);
    return null;
  }
}


import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer, bigint, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: text('role').default('user').notNull(),
  storageQuota: bigint('storage_quota', { mode: 'number' }).default(5368709120),
  storageUsed: bigint('storage_used', { mode: 'number' }).default(0),
  plan: text('plan').default('free').notNull(),
  status: text('status').default('active').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const images = pgTable('images', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  slug: text('slug'),
  description: text('description'),
  storageUrl: text('storage_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  size: integer('size').default(0).notNull(),
  width: integer('width'),
  height: integer('height'),
  mimeType: text('mime_type'),
  visibility: text('visibility').default('public').notNull(),
  likes: integer('likes').default(0).notNull(),
  views: integer('views').default(0).notNull(),
  downloads: integer('downloads').default(0).notNull(),
  tags: text('tags'),
  storageProvider: text('storage_provider').default('cloudinary'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  images: many(images),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  author: one(users, {
    fields: [images.userId],
    references: [users.uid],
  }),
}));

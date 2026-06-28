import { and, count, desc, eq, like, or } from 'drizzle-orm';

import { db } from '@/core/db';
import { prompt } from '@/config/db/schema';

export interface Prompt {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  image: string | null;
  promptTitle: string;
  promptDescription: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  sort: number;
}

export interface NewPrompt {
  id: string;
  userId: string;
  title: string;
  description?: string;
  image?: string;
  promptTitle: string;
  promptDescription?: string;
  status: string;
  sort?: number;
}

export interface UpdatePrompt {
  title?: string;
  description?: string;
  image?: string;
  promptTitle?: string;
  promptDescription?: string;
  status?: string;
  sort?: number;
}

export const PromptStatus = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
} as const;

export async function getPrompts({
  page = 1,
  limit = 30,
  status,
  keyword,
}: {
  page?: number;
  limit?: number;
  status?: string;
  keyword?: string;
} = {}): Promise<Prompt[]> {
  const offset = (page - 1) * limit;
  
  const conditions = [];
  if (status) {
    conditions.push(eq(prompt.status, status));
  }
  if (keyword) {
    conditions.push(
      or(
        like(prompt.title, `%${keyword}%`),
        like(prompt.description, `%${keyword}%`),
        like(prompt.promptTitle, `%${keyword}%`),
        like(prompt.promptDescription, `%${keyword}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const database = await db();
  
  return database
    .select()
    .from(prompt)
    .where(where)
    .orderBy(desc(prompt.sort), desc(prompt.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPromptsCount({
  status,
  keyword,
}: {
  status?: string;
  keyword?: string;
} = {}): Promise<number> {
  const conditions = [];
  if (status) {
    conditions.push(eq(prompt.status, status));
  }
  if (keyword) {
    conditions.push(
      or(
        like(prompt.title, `%${keyword}%`),
        like(prompt.description, `%${keyword}%`),
        like(prompt.promptTitle, `%${keyword}%`),
        like(prompt.promptDescription, `%${keyword}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const database = await db();
  
  const result = await database
    .select({ count: count() })
    .from(prompt)
    .where(where);

  return result[0]?.count || 0;
}

export async function findPrompt({ id }: { id: string }): Promise<Prompt | null> {
  const database = await db();
  const result = await database.select().from(prompt).where(eq(prompt.id, id)).limit(1);
  return result[0] || null;
}

export async function findPublishedPromptByTitle(
  title: string
): Promise<Prompt | null> {
  const database = await db();
  const result = await database
    .select()
    .from(prompt)
    .where(
      and(eq(prompt.title, title), eq(prompt.status, PromptStatus.PUBLISHED))
    )
    .orderBy(desc(prompt.sort), desc(prompt.createdAt))
    .limit(1);

  return result[0] || null;
}

export async function findPublishedPromptByPromptTitle(
  promptTitle: string
): Promise<Prompt | null> {
  const database = await db();
  const result = await database
    .select()
    .from(prompt)
    .where(
      and(
        eq(prompt.promptTitle, promptTitle),
        eq(prompt.status, PromptStatus.PUBLISHED)
      )
    )
    .orderBy(desc(prompt.sort), desc(prompt.createdAt))
    .limit(1);

  return result[0] || null;
}

export async function addPrompt(data: NewPrompt): Promise<boolean> {
  try {
    const database = await db();
    await database.insert(prompt).values(data);
    return true;
  } catch (error) {
    console.error('Add prompt error:', error);
    return false;
  }
}

export async function updatePrompt(id: string, data: UpdatePrompt): Promise<boolean> {
  try {
    const database = await db();
    await database.update(prompt).set(data).where(eq(prompt.id, id));
    return true;
  } catch (error) {
    console.error('Update prompt error:', error);
    return false;
  }
}

export async function deletePrompt(id: string): Promise<boolean> {
  try {
    const database = await db();
    await database.delete(prompt).where(eq(prompt.id, id));
    return true;
  } catch (error) {
    console.error('Delete prompt error:', error);
    return false;
  }
}

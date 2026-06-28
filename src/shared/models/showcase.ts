import { eq, desc, asc, isNull, or, and, ilike, sql, count } from 'drizzle-orm';

import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';

export interface Showcase {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  prompt: string | null;
  image: string;
  tags: string | null;
  isPublic: boolean | null;
  createdAt: Date;
}

export interface NewShowcase {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  prompt?: string | null;
  image: string;
  tags?: string | null;
  isPublic?: boolean;
}

export function isShowcasePublicValue(value?: boolean | null) {
  return value !== false;
}

const legacyShowcaseSelection = {
  id: showcase.id,
  userId: showcase.userId,
  title: showcase.title,
  description: showcase.description,
  prompt: showcase.prompt,
  image: showcase.image,
  tags: showcase.tags,
  isPublic: sql<boolean>`true`,
  createdAt: showcase.createdAt,
};

function isMissingIsPublicColumn(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return message.includes('is_public') || message.includes('isPublic');
}

export async function addShowcase(data: NewShowcase): Promise<Showcase | null> {
  try {
    const result = await db().insert(showcase).values(data).returning();
    return result[0] || null;
  } catch (error) {
    if (isMissingIsPublicColumn(error)) {
      try {
        const { isPublic: _ignored, ...legacyData } = data;
        const result = await db().insert(showcase).values(legacyData as NewShowcase).returning();
        return result[0]
          ? {
              ...result[0],
              isPublic: true,
            }
          : null;
      } catch (fallbackError) {
        console.error('Failed to add showcase with legacy fallback:', fallbackError);
      }
    }
    console.error('Failed to add showcase:', error);
    return null;
  }
}

export async function addShowcaseIfAbsent(data: NewShowcase): Promise<Showcase | null> {
  try {
    const result = await db()
      .insert(showcase)
      .values(data)
      .onConflictDoNothing({ target: showcase.id })
      .returning();

    if (result[0]) {
      return result[0];
    }

    const [existing] = await db()
      .select()
      .from(showcase)
      .where(eq(showcase.id, data.id));
    return existing || null;
  } catch (error) {
    if (isMissingIsPublicColumn(error)) {
      try {
        const { isPublic: _ignored, ...legacyData } = data;
        const result = await db()
          .insert(showcase)
          .values(legacyData as NewShowcase)
          .onConflictDoNothing({ target: showcase.id })
          .returning();

        if (result[0]) {
          return {
            ...result[0],
            isPublic: true,
          };
        }

        const [existing] = await db()
          .select(legacyShowcaseSelection)
          .from(showcase)
          .where(eq(showcase.id, data.id));
        return existing || null;
      } catch (fallbackError) {
        console.error('Failed to add showcase if absent with legacy fallback:', fallbackError);
      }
    }
    console.error('Failed to add showcase if absent:', error);
    return null;
  }
}

export interface GetLatestShowcasesOptions {
  limit?: number;
  tags?: string;
  excludeTags?: string;
  searchTerm?: string;
  sortOrder?: 'asc' | 'desc';
  publicOnly?: boolean;
}

export async function getLatestShowcases({
  limit = 20,
  tags,
  excludeTags,
  searchTerm,
  sortOrder = 'desc',
  publicOnly = true,
}: GetLatestShowcasesOptions = {}): Promise<Showcase[]> {
  try {
    const conditions = [];
    const tagsText = sql<string>`cast(${showcase.tags} as text)`;

    if (publicOnly) {
      conditions.push(or(eq(showcase.isPublic, true), isNull(showcase.isPublic)));
    }

    if (tags) {
      const tagList = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      if (tagList.length > 0) {
        const tagConditions = tagList.map((tag) =>
          or(
            sql`${tagsText} ilike ${`${tag},%`}`,
            sql`${tagsText} ilike ${`%,${tag},%`}`,
            sql`${tagsText} ilike ${`%,${tag}`}`,
            sql`${tagsText} ilike ${tag}`
          )
        );
        conditions.push(and(...tagConditions));
      }
    }

    if (excludeTags) {
      conditions.push(
        or(sql`${tagsText} not ilike ${`%${excludeTags}%`}`, isNull(showcase.tags))
      );
    }

    if (searchTerm) {
      conditions.push(
        or(
          ilike(showcase.prompt, `%${searchTerm}%`),
          ilike(showcase.title, `%${searchTerm}%`),
          sql`${tagsText} ilike ${`%${searchTerm}%`}`
        )
      );
    }

    let query = db().select().from(showcase);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query
      .orderBy(sortOrder === 'asc' ? asc(showcase.createdAt) : desc(showcase.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    if (isMissingIsPublicColumn(error)) {
      try {
        const conditions = [];
        const tagsText = sql<string>`cast(${showcase.tags} as text)`;

        if (tags) {
          const tagList = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
          if (tagList.length > 0) {
            const tagConditions = tagList.map((tag) =>
              or(
                sql`${tagsText} ilike ${`${tag},%`}`,
                sql`${tagsText} ilike ${`%,${tag},%`}`,
                sql`${tagsText} ilike ${`%,${tag}`}`,
                sql`${tagsText} ilike ${tag}`
              )
            );
            conditions.push(and(...tagConditions));
          }
        }

        if (excludeTags) {
          conditions.push(
            or(sql`${tagsText} not ilike ${`%${excludeTags}%`}`, isNull(showcase.tags))
          );
        }

        if (searchTerm) {
          conditions.push(
            or(
              ilike(showcase.prompt, `%${searchTerm}%`),
              ilike(showcase.title, `%${searchTerm}%`),
              sql`${tagsText} ilike ${`%${searchTerm}%`}`
            )
          );
        }

        let query = db().select(legacyShowcaseSelection).from(showcase);
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        return await query
          .orderBy(sortOrder === 'asc' ? asc(showcase.createdAt) : desc(showcase.createdAt))
          .limit(limit);
      } catch (fallbackError) {
        console.error('Failed to get latest showcases with legacy fallback:', fallbackError);
      }
    }
    console.error('Failed to get showcases:', error);
    return [];
  }
}

export async function getUserShowcases(userId: string): Promise<Showcase[]> {
  try {
    const result = await db()
      .select()
      .from(showcase)
      .where(eq(showcase.userId, userId))
      .orderBy(desc(showcase.createdAt));
    return result;
  } catch (error) {
    if (isMissingIsPublicColumn(error)) {
      try {
        return await db()
          .select(legacyShowcaseSelection)
          .from(showcase)
          .where(eq(showcase.userId, userId))
          .orderBy(desc(showcase.createdAt));
      } catch (fallbackError) {
        console.error('Failed to get user showcases with legacy fallback:', fallbackError);
      }
    }
    console.error('Failed to get user showcases:', error);
    return [];
  }
}

export async function getShowcase(id: string): Promise<Showcase | null> {
  try {
    const result = await db()
      .select()
      .from(showcase)
      .where(eq(showcase.id, id));
    return result[0] || null;
  } catch (error) {
    if (isMissingIsPublicColumn(error)) {
      try {
        const result = await db()
          .select(legacyShowcaseSelection)
          .from(showcase)
          .where(eq(showcase.id, id));
        return result[0] || null;
      } catch (fallbackError) {
        console.error('Failed to get showcase with legacy fallback:', fallbackError);
      }
    }
    console.error('Failed to get showcase:', error);
    return null;
  }
}

export async function updateShowcase(
  id: string,
  data: Partial<NewShowcase>
): Promise<Showcase | null> {
  try {
    const result = await db()
      .update(showcase)
      .set(data)
      .where(eq(showcase.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    if (isMissingIsPublicColumn(error)) {
      try {
        const { isPublic: _ignored, ...legacyData } = data;
        const result = await db()
          .update(showcase)
          .set(legacyData)
          .where(eq(showcase.id, id))
          .returning();
        return result[0]
          ? {
              ...result[0],
              isPublic: true,
            }
          : null;
      } catch (fallbackError) {
        console.error('Failed to update showcase with legacy fallback:', fallbackError);
      }
    }
    console.error('Failed to update showcase:', error);
    return null;
  }
}

export async function deleteShowcase(id: string): Promise<boolean> {
  try {
    await db().delete(showcase).where(eq(showcase.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete showcase:', error);
    return false;
  }
}

export async function getShowcasesCount({
  keyword,
}: {
  keyword?: string;
} = {}): Promise<number> {
  try {
    const tagsText = sql<string>`cast(${showcase.tags} as text)`;
    const where = keyword
      ? or(
          ilike(showcase.title, `%${keyword}%`),
          ilike(showcase.description, `%${keyword}%`),
          ilike(showcase.prompt, `%${keyword}%`),
          sql`${tagsText} ilike ${`%${keyword}%`}`
        )
      : undefined;
    const result = await db()
      .select({ count: count() })
      .from(showcase)
      .where(where);
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Failed to get showcases count:', error);
    return 0;
  }
}

export async function getShowcases({
  page = 1,
  limit = 20,
  publicOnly = false,
  keyword,
}: {
  page?: number;
  limit?: number;
  publicOnly?: boolean;
  keyword?: string;
}): Promise<Showcase[]> {
  const offset = (page - 1) * limit;

  try {
    const tagsText = sql<string>`cast(${showcase.tags} as text)`;
    const conditions = [];

    if (publicOnly) {
      conditions.push(or(eq(showcase.isPublic, true), isNull(showcase.isPublic)));
    }

    if (keyword) {
      conditions.push(
        or(
          ilike(showcase.title, `%${keyword}%`),
          ilike(showcase.description, `%${keyword}%`),
          ilike(showcase.prompt, `%${keyword}%`),
          sql`${tagsText} ilike ${`%${keyword}%`}`
        )
      );
    }

    let query = db().select().from(showcase);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query
      .orderBy(desc(showcase.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    if (isMissingIsPublicColumn(error)) {
      try {
        const tagsText = sql<string>`cast(${showcase.tags} as text)`;
        const conditions = [];

        if (keyword) {
          conditions.push(
            or(
              ilike(showcase.title, `%${keyword}%`),
              ilike(showcase.description, `%${keyword}%`),
              ilike(showcase.prompt, `%${keyword}%`),
              sql`${tagsText} ilike ${`%${keyword}%`}`
            )
          );
        }

        let query = db().select(legacyShowcaseSelection).from(showcase);
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        return await query
          .orderBy(desc(showcase.createdAt))
          .limit(limit)
          .offset(offset);
      } catch (fallbackError) {
        console.error('Failed to get showcases with legacy fallback:', fallbackError);
      }
    }
    console.error('Failed to get showcases:', error);
    return [];
  }
}

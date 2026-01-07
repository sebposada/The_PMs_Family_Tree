import { eq, and, desc, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  profiles, 
  Profile,
  InsertProfile,
  people,
  Person,
  InsertPerson,
  partnerships,
  Partnership,
  InsertPartnership,
  partnershipChildren,
  PartnershipChild,
  InsertPartnershipChild,
  media,
  Media,
  InsertMedia,
  mediaPeople,
  MediaPerson,
  InsertMediaPerson,
  comments,
  Comment,
  InsertComment,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ Users & Profiles ============

const ADMIN_EMAIL = "sebasposada7@gmail.com";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    // Check if this is the designated admin email
    const isAdminEmail = user.email === ADMIN_EMAIL;
    
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId || isAdminEmail) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
    
    // Auto-approve admin user
    if (isAdminEmail) {
      const [insertedUser] = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
      if (insertedUser) {
        const existingProfile = await getProfileByUserId(insertedUser.id);
        if (!existingProfile) {
          await db.insert(profiles).values({
            userId: insertedUser.id,
            approved: true,
            displayName: user.name || "Admin",
          });
        } else if (!existingProfile.approved) {
          await db.update(profiles).set({ approved: true }).where(eq(profiles.userId, insertedUser.id));
        }
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(profiles).values(profile).onDuplicateKeyUpdate({
    set: {
      displayName: profile.displayName,
      approved: profile.approved,
      updatedAt: new Date(),
    },
  });
}

export async function updateProfileDisplayName(userId: number, displayName: string) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getProfileByUserId(userId);
  if (existing) {
    await db.update(profiles).set({ displayName, updatedAt: new Date() }).where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, displayName, approved: false });
  }
}

export async function approveUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getProfileByUserId(userId);
  if (existing) {
    await db.update(profiles).set({ approved: true, updatedAt: new Date() }).where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, approved: true });
  }
}

export async function getUnapprovedUsers() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      user: users,
      profile: profiles,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(or(eq(profiles.approved, false), sql`${profiles.approved} IS NULL`));
  
  return result;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      user: users,
      profile: profiles,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId));
  
  return result;
}

// ============ People ============

export async function createPerson(person: InsertPerson) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(people).values(person);
  return Number(result[0].insertId);
}

export async function updatePerson(id: number, person: Partial<InsertPerson>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(people).set({ ...person, updatedAt: new Date() }).where(eq(people.id, id));
}

export async function deletePerson(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(people).where(eq(people.id, id));
}

export async function getPersonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select({
      id: people.id,
      firstName: people.firstName,
      lastName: people.lastName,
      birthDate: people.birthDate,
      deathDate: people.deathDate,
      birthPlace: people.birthPlace,
      deathPlace: people.deathPlace,
      bioMarkdown: people.bioMarkdown,
      primaryMediaId: people.primaryMediaId,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
      primaryPhotoUrl: media.url,
    })
    .from(people)
    .leftJoin(media, eq(people.primaryMediaId, media.id))
    .where(eq(people.id, id))
    .limit(1);
  
  return result[0];
}

export async function getAllPeople() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: people.id,
      firstName: people.firstName,
      lastName: people.lastName,
      birthDate: people.birthDate,
      deathDate: people.deathDate,
      birthPlace: people.birthPlace,
      deathPlace: people.deathPlace,
      bioMarkdown: people.bioMarkdown,
      primaryMediaId: people.primaryMediaId,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
      primaryPhotoUrl: media.url,
    })
    .from(people)
    .leftJoin(media, eq(people.primaryMediaId, media.id));
  
  return result;
}

export async function searchPeople(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;
  return await db
    .select({
      id: people.id,
      firstName: people.firstName,
      lastName: people.lastName,
      birthDate: people.birthDate,
      deathDate: people.deathDate,
      birthPlace: people.birthPlace,
      deathPlace: people.deathPlace,
      bioMarkdown: people.bioMarkdown,
      primaryMediaId: people.primaryMediaId,
      createdAt: people.createdAt,
      updatedAt: people.updatedAt,
      primaryPhotoUrl: media.url,
    })
    .from(people)
    .leftJoin(media, eq(people.primaryMediaId, media.id))
    .where(
      or(
        like(people.firstName, searchPattern),
        like(people.lastName, searchPattern)
      )
    );
}

// ============ Partnerships ============

export async function createPartnership(partnership: InsertPartnership) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(partnerships).values(partnership);
  return Number(result[0].insertId);
}

export async function updatePartnership(id: number, partnership: Partial<InsertPartnership>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(partnerships).set(partnership).where(eq(partnerships.id, id));
}

export async function deletePartnership(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(partnerships).where(eq(partnerships.id, id));
}

export async function getPartnershipById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(partnerships).where(eq(partnerships.id, id)).limit(1);
  return result[0];
}

export async function getPartnershipsForPerson(personId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(partnerships)
    .where(or(eq(partnerships.partner1Id, personId), eq(partnerships.partner2Id, personId)));
}

export async function getAllPartnerships() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(partnerships);
}

// ============ Partnership Children ============

export async function addChildToPartnership(partnershipId: number, childId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(partnershipChildren).values({ partnershipId, childId }).onDuplicateKeyUpdate({ set: { partnershipId, childId } });
}

export async function removeChildFromPartnership(partnershipId: number, childId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(partnershipChildren).where(
    and(
      eq(partnershipChildren.partnershipId, partnershipId),
      eq(partnershipChildren.childId, childId)
    )
  );
}

export async function getChildrenForPartnership(partnershipId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ person: people })
    .from(partnershipChildren)
    .innerJoin(people, eq(partnershipChildren.childId, people.id))
    .where(eq(partnershipChildren.partnershipId, partnershipId));
  
  return result.map(r => r.person);
}

export async function getPartnershipsForChild(childId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ partnership: partnerships })
    .from(partnershipChildren)
    .innerJoin(partnerships, eq(partnershipChildren.partnershipId, partnerships.id))
    .where(eq(partnershipChildren.childId, childId));
  
  return result.map(r => r.partnership);
}

// ============ Media ============

export async function createMedia(mediaData: InsertMedia) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(media).values(mediaData);
  return Number(result[0].insertId);
}

export async function updateMedia(id: number, mediaData: Partial<InsertMedia>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(media).set(mediaData).where(eq(media.id, id));
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(media).where(eq(media.id, id));
}

export async function getMediaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
  return result[0];
}

export async function getMediaForPerson(personId: number, category?: "photo" | "document") {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ media: media })
    .from(mediaPeople)
    .innerJoin(media, eq(mediaPeople.mediaId, media.id))
    .where(
      category
        ? and(eq(mediaPeople.personId, personId), eq(media.category, category))
        : eq(mediaPeople.personId, personId)
    );
  
  return result.map(r => r.media);
}

export async function getAllPhotos() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(media).where(eq(media.category, "photo"));
}

export async function searchPhotos(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;
  
  // Search in captions
  const captionResults = await db
    .select()
    .from(media)
    .where(and(eq(media.category, "photo"), like(media.caption, searchPattern)));
  
  // Search in tagged people names
  const taggedResults = await db
    .select({ media: media })
    .from(media)
    .innerJoin(mediaPeople, eq(media.id, mediaPeople.mediaId))
    .innerJoin(people, eq(mediaPeople.personId, people.id))
    .where(
      and(
        eq(media.category, "photo"),
        or(like(people.firstName, searchPattern), like(people.lastName, searchPattern))
      )
    );
  
  // Combine and deduplicate
  const combined = [...captionResults, ...taggedResults.map(r => r.media)];
  const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
  
  return unique;
}

// ============ Media People Tags ============

export async function tagPersonInMedia(mediaId: number, personId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(mediaPeople).values({ mediaId, personId }).onDuplicateKeyUpdate({ set: { mediaId, personId } });
}

export async function untagPersonFromMedia(mediaId: number, personId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(mediaPeople).where(
    and(eq(mediaPeople.mediaId, mediaId), eq(mediaPeople.personId, personId))
  );
}

export async function getTaggedPeopleForMedia(mediaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ person: people })
    .from(mediaPeople)
    .innerJoin(people, eq(mediaPeople.personId, people.id))
    .where(eq(mediaPeople.mediaId, mediaId));
  
  return result.map(r => r.person);
}

// ============ Comments ============

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(comments).values(comment);
  return Number(result[0].insertId);
}

export async function updateComment(id: number, body: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(comments).set({ body, updatedAt: new Date() }).where(eq(comments.id, id));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(comments).set({ isDeleted: true, updatedAt: new Date() }).where(eq(comments.id, id));
}

export async function getCommentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  return result[0];
}

export async function getCommentsForPerson(personId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      comment: comments,
      author: users,
      profile: profiles,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorUserId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(comments.personId, personId), eq(comments.isDeleted, false)))
    .orderBy(desc(comments.createdAt));
  
  return result;
}

export async function getRecentComments(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      comment: comments,
      author: users,
      profile: profiles,
      person: people,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorUserId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .innerJoin(people, eq(comments.personId, people.id))
    .where(eq(comments.isDeleted, false))
    .orderBy(desc(comments.createdAt))
    .limit(limit);
  
  return result;
}

// ============ Stats ============

export async function getStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, approvedUsers: 0, totalPeople: 0, totalPhotos: 0, totalComments: 0 };
  
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [approvedCount] = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.approved, true));
  const [peopleCount] = await db.select({ count: sql<number>`count(*)` }).from(people);
  const [photosCount] = await db.select({ count: sql<number>`count(*)` }).from(media).where(eq(media.category, "photo"));
  const [commentsCount] = await db.select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.isDeleted, false));
  
  return {
    totalUsers: usersCount?.count ?? 0,
    approvedUsers: approvedCount?.count ?? 0,
    totalPeople: peopleCount?.count ?? 0,
    totalPhotos: photosCount?.count ?? 0,
    totalComments: commentsCount?.count ?? 0,
  };
}

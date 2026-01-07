import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

async function createRegularUserContext(): Promise<TrpcContext> {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  // Create user in database first (required for foreign key constraint)
  await db.upsertUser(user);

  // Get the actual user ID from database
  const dbUser = await db.getUserByOpenId(user.openId);
  if (!dbUser) {
    throw new Error("Failed to create user in database");
  }

  // Create approved profile for this user using database helper
  await db.upsertProfile({
    userId: dbUser.id,
    displayName: "Regular User",
    approved: true,
  });

  // Verify profile was created
  const profile = await db.getProfileByUserId(dbUser.id);
  if (!profile || !profile.approved) {
    throw new Error("Failed to create approved profile for test user");
  }

  // Update user object with actual database ID
  user.id = dbUser.id;

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("People Management", () => {
  it("allows admin to create a person", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.people.create({
      firstName: "Test",
      lastName: "Person",
      birthDate: "1990-01-01",
      birthPlace: "Test City",
      bioMarkdown: "Test bio",
    });

    expect(result.id).toBeDefined();
    expect(result.id).toBeDefined();
    // Verify by fetching
    const all = await caller.people.getAll();
    const created = all.find((p) => p.id === result.id);
    expect(created?.firstName).toBe("Test");
    expect(created?.lastName).toBe("Person");
  });

  it("prevents non-admin from creating a person", async () => {
    const ctx = await createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.people.create({
        firstName: "Test",
        lastName: "Person",
      })
    ).rejects.toThrow();
  });

  it("allows admin to update a person", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create first
    const created = await caller.people.create({
      firstName: "Original",
      lastName: "Name",
    });

    // Update
    await caller.people.update({
      id: created.id,
      firstName: "Updated",
      lastName: "Name",
    });

    // Verify by fetching
    const all = await caller.people.getAll();
    const updated = all.find((p) => p.id === created.id);
    expect(updated?.firstName).toBe("Updated");
  });

  it("allows admin to delete a person", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create first
    const created = await caller.people.create({
      firstName: "ToDelete",
      lastName: "Person",
    });

    // Delete
    const result = await caller.people.delete({ id: created.id });
    expect(result.success).toBe(true);

    // Verify deleted
    const all = await caller.people.getAll();
    expect(all.find((p) => p.id === created.id)).toBeUndefined();
  });

  it("allows approved users to view people", async () => {
    const ctx = await createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    const people = await caller.people.getAll();
    expect(Array.isArray(people)).toBe(true);
  });
});

describe("Partnerships Management", () => {
  it("allows admin to create a partnership", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create two people first
    const person1 = await caller.people.create({
      firstName: "Partner",
      lastName: "One",
    });

    const person2 = await caller.people.create({
      firstName: "Partner",
      lastName: "Two",
    });

    // Create partnership
    const partnership = await caller.partnerships.create({
      partner1Id: person1.id,
      partner2Id: person2.id,
      startDate: "2000-01-01",
    });

    expect(partnership.id).toBeDefined();
    // Partnership create returns success flag, fetch to verify
    const partnerships = await caller.partnerships.getAll();
    const created = partnerships.find((p) => p.id === partnership.id);
    expect(created?.partner1Id).toBe(person1.id);
    expect(created?.partner2Id).toBe(person2.id);
  });

  it("prevents creating partnership with same person twice", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const person = await caller.people.create({
      firstName: "Single",
      lastName: "Person",
    });

    await expect(
      caller.partnerships.create({
        partner1Id: person.id,
        partner2Id: person.id,
      })
    ).rejects.toThrow();
  });

  it("allows admin to add children to partnership", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create parents and child
    const parent1 = await caller.people.create({
      firstName: "Parent",
      lastName: "One",
    });

    const parent2 = await caller.people.create({
      firstName: "Parent",
      lastName: "Two",
    });

    const child = await caller.people.create({
      firstName: "Child",
      lastName: "One",
    });

    // Create partnership
    const partnership = await caller.partnerships.create({
      partner1Id: parent1.id,
      partner2Id: parent2.id,
    });

    // Add child
    const result = await caller.partnerships.addChild({
      partnershipId: partnership.id,
      childId: child.id,
    });

    expect(result.success).toBe(true);

    // Verify child is linked
    const children = await caller.partnerships.getChildren({
      partnershipId: partnership.id,
    });

    expect(children.length).toBe(1);
    expect(children[0]?.id).toBe(child.id);
  });

  it("allows admin to remove children from partnership", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create parents and child
    const parent1 = await caller.people.create({
      firstName: "Parent",
      lastName: "Three",
    });

    const parent2 = await caller.people.create({
      firstName: "Parent",
      lastName: "Four",
    });

    const child = await caller.people.create({
      firstName: "Child",
      lastName: "Two",
    });

    // Create partnership and add child
    const partnership = await caller.partnerships.create({
      partner1Id: parent1.id,
      partner2Id: parent2.id,
    });

    await caller.partnerships.addChild({
      partnershipId: partnership.id,
      childId: child.id,
    });

    // Remove child
    const result = await caller.partnerships.removeChild({
      partnershipId: partnership.id,
      childId: child.id,
    });

    expect(result.success).toBe(true);

    // Verify child is removed
    const children = await caller.partnerships.getChildren({
      partnershipId: partnership.id,
    });

    expect(children.length).toBe(0);
  });

  it("prevents non-admin from creating partnerships", async () => {
    const ctx = await createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.partnerships.create({
        partner1Id: 1,
        partner2Id: 2,
      })
    ).rejects.toThrow();
  });
});

describe("Media Management", () => {
  it("allows admin to create media records", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const media = await caller.media.create({
      fileKey: "test/photo.jpg",
      url: "https://example.com/photo.jpg",
      category: "photo",
      caption: "Test photo",
    });

    expect(media.id).toBeDefined();
    // Media create returns success flag, fetch to verify
    const allMedia = await caller.media.getAll();
    const created = allMedia.find((m) => m.id === media.id);
    expect(created?.fileKey).toBe("test/photo.jpg");
    expect(created?.category).toBe("photo");
  });

  it("allows admin to tag people in media", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create person and media
    const person = await caller.people.create({
      firstName: "Tagged",
      lastName: "Person",
    });

    const media = await caller.media.create({
      fileKey: "test/photo2.jpg",
      url: "https://example.com/photo2.jpg",
      category: "photo",
    });

    // Tag person
    const result = await caller.media.tagPerson({
      mediaId: media.id,
      personId: person.id,
    });

    expect(result.success).toBe(true);

    // Verify tag
    const taggedPeople = await caller.media.getTaggedPeople({
      mediaId: media.id,
    });

    expect(taggedPeople.length).toBe(1);
    expect(taggedPeople[0]?.id).toBe(person.id);
  });

  it("allows admin to untag people from media", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create person and media
    const person = await caller.people.create({
      firstName: "Untagged",
      lastName: "Person",
    });

    const media = await caller.media.create({
      fileKey: "test/photo3.jpg",
      url: "https://example.com/photo3.jpg",
      category: "photo",
    });

    // Tag and untag
    await caller.media.tagPerson({
      mediaId: media.id,
      personId: person.id,
    });

    const result = await caller.media.untagPerson({
      mediaId: media.id,
      personId: person.id,
    });

    expect(result.success).toBe(true);

    // Verify untag
    const taggedPeople = await caller.media.getTaggedPeople({
      mediaId: media.id,
    });

    expect(taggedPeople.length).toBe(0);
  });

  it("allows admin to delete media", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const media = await caller.media.create({
      fileKey: "test/delete.jpg",
      url: "https://example.com/delete.jpg",
      category: "photo",
    });

    const result = await caller.media.delete({ id: media.id });
    expect(result.success).toBe(true);
  });

  it("prevents non-admin from creating media", async () => {
    const ctx = await createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.media.create({
        fileKey: "test/unauthorized.jpg",
        url: "https://example.com/unauthorized.jpg",
        category: "photo",
      })
    ).rejects.toThrow();
  });

  it("allows approved users to view media", async () => {
    const ctx = await createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    const media = await caller.media.getAll();
    expect(Array.isArray(media)).toBe(true);
  });
});

describe("Stats", () => {
  it("allows admin to view stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.stats.get();

    expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
    expect(stats.approvedUsers).toBeGreaterThanOrEqual(0);
    expect(stats.totalPeople).toBeGreaterThanOrEqual(0);
    expect(stats.totalPhotos).toBeGreaterThanOrEqual(0);
    expect(stats.totalComments).toBeGreaterThanOrEqual(0);
  });

  it("prevents non-admin from viewing stats", async () => {
    const ctx = await createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.stats.get()).rejects.toThrow();
  });
});

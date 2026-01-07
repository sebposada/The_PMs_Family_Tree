import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { people, media, mediaPeople } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";

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

describe("Primary Photo Feature", () => {
  it("allows admin to set primary photo when updating a person", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test person
    const personId = await caller.people.create({
      firstName: "Test",
      lastName: "Person",
      birthDate: "1990-01-01",
    });

    // Create a test media item
    const mediaId = await caller.media.create({
      fileKey: "test-photo.jpg",
      url: "https://example.com/test-photo.jpg",
      category: "photo",
      caption: "Test photo",
    });

    // Tag the person in the media
    await caller.media.tagPerson({
      mediaId: mediaId.id,
      personId: personId.id,
    });

    // Update person with primary photo
    await caller.people.update({
      id: personId.id,
      primaryMediaId: mediaId.id,
    });

    // Verify the primary photo was set
    const updatedPerson = await caller.people.getById({ id: personId.id });
    expect(updatedPerson?.primaryMediaId).toBe(mediaId.id);

    // Cleanup
    await db.delete(mediaPeople).where(
      and(eq(mediaPeople.mediaId, mediaId.id), eq(mediaPeople.personId, personId.id))
    );
    await db.delete(media).where(eq(media.id, mediaId.id));
    await db.delete(people).where(eq(people.id, personId.id));
  });

  it("retrieves photos tagged with a specific person", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test person
    const personId = await caller.people.create({
      firstName: "Photo",
      lastName: "Test",
      birthDate: "1985-05-15",
    });

    // Create two test media items
    const media1 = await caller.media.create({
      fileKey: "photo1.jpg",
      url: "https://example.com/photo1.jpg",
      category: "photo",
      caption: "First photo",
    });

    const media2 = await caller.media.create({
      fileKey: "photo2.jpg",
      url: "https://example.com/photo2.jpg",
      category: "photo",
      caption: "Second photo",
    });

    // Tag the person in both photos
    await caller.media.tagPerson({
      mediaId: media1.id,
      personId: personId.id,
    });

    await caller.media.tagPerson({
      mediaId: media2.id,
      personId: personId.id,
    });

    // Retrieve photos for the person
    const personPhotos = await caller.media.getByPerson({ personId: personId.id });

    // Verify both photos are returned
    expect(personPhotos).toHaveLength(2);
    expect(personPhotos.map(p => p.id)).toContain(media1.id);
    expect(personPhotos.map(p => p.id)).toContain(media2.id);

    // Cleanup
    await db.delete(mediaPeople).where(eq(mediaPeople.personId, personId.id));
    await db.delete(media).where(eq(media.id, media1.id));
    await db.delete(media).where(eq(media.id, media2.id));
    await db.delete(people).where(eq(people.id, personId.id));
  });

  it("allows clearing primary photo by setting it to null", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test person with a primary photo
    const personId = await caller.people.create({
      firstName: "Clear",
      lastName: "Photo",
      birthDate: "1975-03-20",
    });

    const mediaId = await caller.media.create({
      fileKey: "clear-test.jpg",
      url: "https://example.com/clear-test.jpg",
      category: "photo",
    });

    await caller.media.tagPerson({
      mediaId: mediaId.id,
      personId: personId.id,
    });

    // Set primary photo
    await caller.people.update({
      id: personId.id,
      primaryMediaId: mediaId.id,
    });

    let person = await caller.people.getById({ id: personId.id });
    expect(person?.primaryMediaId).toBe(mediaId.id);

    // Clear primary photo
    await caller.people.update({
      id: personId.id,
      primaryMediaId: null,
    });

    person = await caller.people.getById({ id: personId.id });
    expect(person?.primaryMediaId).toBeNull();

    // Cleanup
    await db.delete(mediaPeople).where(
      and(eq(mediaPeople.mediaId, mediaId.id), eq(mediaPeople.personId, personId.id))
    );
    await db.delete(media).where(eq(media.id, mediaId.id));
    await db.delete(people).where(eq(people.id, personId.id));
  });
});

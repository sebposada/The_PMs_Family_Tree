import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("Family Tree Data", () => {
  it("should fetch all people for tree visualization", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const people = await caller.people.getAll();

    expect(people).toBeDefined();
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThan(0);
    
    // Verify person structure includes required fields for tree
    if (people.length > 0) {
      const person = people[0];
      expect(person).toHaveProperty('id');
      expect(person).toHaveProperty('firstName');
      expect(person).toHaveProperty('lastName');
      expect(person).toHaveProperty('birthDate');
      expect(person).toHaveProperty('deathDate');
      expect(person).toHaveProperty('primaryPhotoUrl');
    }
  });

  it("should fetch all partnerships for tree visualization", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const partnerships = await caller.partnerships.getAll();

    expect(partnerships).toBeDefined();
    expect(Array.isArray(partnerships)).toBe(true);
    
    // Verify partnership structure
    if (partnerships.length > 0) {
      const partnership = partnerships[0];
      expect(partnership).toHaveProperty('id');
      expect(partnership).toHaveProperty('partner1Id');
      expect(partnership).toHaveProperty('partner2Id');
      expect(partnership.partner1Id).not.toBe(partnership.partner2Id);
    }
  });

  it("should fetch all partnership children for tree visualization", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const partnershipChildren = await caller.partnerships.getAllChildren();

    expect(partnershipChildren).toBeDefined();
    expect(Array.isArray(partnershipChildren)).toBe(true);
    
    // Verify partnership children structure
    if (partnershipChildren.length > 0) {
      const pc = partnershipChildren[0];
      expect(pc).toHaveProperty('partnershipId');
      expect(pc).toHaveProperty('childId');
    }
  });

  it("should have consistent data relationships", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const people = await caller.people.getAll();
    const partnerships = await caller.partnerships.getAll();
    const partnershipChildren = await caller.partnerships.getAllChildren();

    const peopleIds = new Set(people.map(p => p.id));

    // Verify all partnership partners exist in people
    partnerships.forEach(partnership => {
      expect(peopleIds.has(partnership.partner1Id)).toBe(true);
      expect(peopleIds.has(partnership.partner2Id)).toBe(true);
    });

    // Verify all children exist in people
    partnershipChildren.forEach(pc => {
      expect(peopleIds.has(pc.childId)).toBe(true);
    });

    // Verify all partnership IDs in children exist in partnerships
    const partnershipIds = new Set(partnerships.map(p => p.id));
    partnershipChildren.forEach(pc => {
      expect(partnershipIds.has(pc.partnershipId)).toBe(true);
    });
  });
});

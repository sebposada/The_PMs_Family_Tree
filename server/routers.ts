import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// ============ Middleware ============

const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const approvedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await db.getProfileByUserId(ctx.user.id);
  if (!profile?.approved && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Your account is pending approval" });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ============ Routers ============

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      
      const profile = await db.getProfileByUserId(ctx.user.id);
      
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        role: ctx.user.role,
        profile: profile ? {
          displayName: profile.displayName,
          approved: profile.approved,
        } : null,
      };
    }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    setDisplayName: protectedProcedure
      .input(z.object({ displayName: z.string().min(1).max(255) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateProfileDisplayName(ctx.user.id, input.displayName);
        return { success: true };
      }),
  }),
  
  users: router({
    getUnapproved: adminProcedure.query(async () => {
      return await db.getUnapprovedUsers();
    }),
    
    approve: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveUser(input.userId);
        return { success: true };
      }),
    
    getAll: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
  }),
  
  people: router({
    getAll: approvedProcedure.query(async () => {
      return await db.getAllPeople();
    }),
    
    getById: approvedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPersonById(input.id);
      }),
    
    search: approvedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchPeople(input.query);
      }),
    
    create: adminProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        birthDate: z.string().optional(),
        deathDate: z.string().optional(),
        birthPlace: z.string().optional(),
        deathPlace: z.string().optional(),
        bioMarkdown: z.string().optional(),
        primaryMediaId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createPerson({
          ...input,
          birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
          deathDate: input.deathDate ? new Date(input.deathDate) : undefined,
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        birthDate: z.string().nullable().optional(),
        deathDate: z.string().nullable().optional(),
        birthPlace: z.string().nullable().optional(),
        deathPlace: z.string().nullable().optional(),
        bioMarkdown: z.string().nullable().optional(),
        primaryMediaId: z.number().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePerson(id, {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePerson(input.id);
        return { success: true };
      }),
  }),
  
  partnerships: router({
    getAll: approvedProcedure.query(async () => {
      return await db.getAllPartnerships();
    }),
    
    getForPerson: approvedProcedure
      .input(z.object({ personId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPartnershipsForPerson(input.personId);
      }),
    
    getChildren: approvedProcedure
      .input(z.object({ partnershipId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChildrenForPartnership(input.partnershipId);
      }),
    
    getAllChildren: approvedProcedure.query(async () => {
      return await db.getAllPartnershipChildren();
    }),
    
    create: adminProcedure
      .input(z.object({
        partner1Id: z.number(),
        partner2Id: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.partner1Id === input.partner2Id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Partners must be different people" });
        }
        const id = await db.createPartnership({
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePartnership(id, {
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePartnership(input.id);
        return { success: true };
      }),
    
    addChild: adminProcedure
      .input(z.object({ partnershipId: z.number(), childId: z.number() }))
      .mutation(async ({ input }) => {
        await db.addChildToPartnership(input.partnershipId, input.childId);
        return { success: true };
      }),
    
    removeChild: adminProcedure
      .input(z.object({ partnershipId: z.number(), childId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeChildFromPartnership(input.partnershipId, input.childId);
        return { success: true };
      }),
  }),
  
  media: router({
    getAll: approvedProcedure.query(async () => {
      return await db.getAllPhotos();
    }),
    
    getById: approvedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMediaById(input.id);
      }),
    
    getForPerson: approvedProcedure
      .input(z.object({ personId: z.number(), category: z.enum(["photo", "document"]).optional() }))
      .query(async ({ input }) => {
        return await db.getMediaForPerson(input.personId, input.category);
      }),
    
    getTaggedPeople: approvedProcedure
      .input(z.object({ mediaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaggedPeopleForMedia(input.mediaId);
      }),
    
    search: approvedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchPhotos(input.query);
      }),
    
    getByPerson: approvedProcedure
      .input(z.object({ personId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMediaForPerson(input.personId);
      }),
    
    create: adminProcedure
      .input(z.object({
        fileKey: z.string(),
        url: z.string(),
        category: z.enum(["photo", "document"]),
        caption: z.string().optional(),
        takenDate: z.string().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createMedia({
          ...input,
          uploaderUserId: ctx.user.id,
          takenDate: input.takenDate ? new Date(input.takenDate) : undefined,
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        caption: z.string().nullable().optional(),
        takenDate: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateMedia(id, {
          ...data,
          takenDate: data.takenDate ? new Date(data.takenDate) : undefined,
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMedia(input.id);
        return { success: true };
      }),
    
    tagPerson: adminProcedure
      .input(z.object({ mediaId: z.number(), personId: z.number() }))
      .mutation(async ({ input }) => {
        await db.tagPersonInMedia(input.mediaId, input.personId);
        return { success: true };
      }),
    
    untagPerson: adminProcedure
      .input(z.object({ mediaId: z.number(), personId: z.number() }))
      .mutation(async ({ input }) => {
        await db.untagPersonFromMedia(input.mediaId, input.personId);
        return { success: true };
      }),
  }),
  
  comments: router({
    getForPerson: approvedProcedure
      .input(z.object({ personId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommentsForPerson(input.personId);
      }),
    
    getRecent: adminProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await db.getRecentComments(input.limit);
      }),
    
    create: approvedProcedure
      .input(z.object({ personId: z.number(), body: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createComment({
          personId: input.personId,
          authorUserId: ctx.user.id,
          body: input.body,
        });
        return { id };
      }),
    
    update: approvedProcedure
      .input(z.object({ id: z.number(), body: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const comment = await db.getCommentById(input.id);
        if (!comment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
        }
        if (comment.authorUserId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own comments" });
        }
        await db.updateComment(input.id, input.body);
        return { success: true };
      }),
    
    delete: approvedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const comment = await db.getCommentById(input.id);
        if (!comment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
        }
        if (comment.authorUserId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own comments" });
        }
        await db.deleteComment(input.id);
        return { success: true };
      }),
  }),
  
  stats: router({
    get: adminProcedure.query(async () => {
      return await db.getStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;

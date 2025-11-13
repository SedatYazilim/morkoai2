import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateImage, getAvailableModels } from "./pollinations";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  generation: router({
    // Generate image from prompt (no auth required)
    generate: publicProcedure
      .input(
        z.object({
          prompt: z.string().min(1).max(1000),
          model: z.string().optional(),
          width: z.number().min(256).max(2048).optional(),
          height: z.number().min(256).max(2048).optional(),
          seed: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Generate image using Pollinations AI
        const result = await generateImage({
          prompt: input.prompt,
          model: input.model,
          width: input.width,
          height: input.height,
          seed: input.seed,
        });

        // Download image and upload to storage
        const imageResponse = await fetch(result.imageUrl);
        if (!imageResponse.ok) {
          throw new Error("Failed to download generated image");
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const sessionId = ctx.user?.id || `guest-${randomSuffix}`;
        const fileKey = `generations/${sessionId}/${timestamp}-${randomSuffix}.png`;

        // Upload to storage
        const { url: storageUrl } = await storagePut(fileKey, imageBuffer, "image/png");

        // Save to database
        await db.createGeneration({
          userId: ctx.user?.id || 0,
          prompt: result.prompt,
          imageUrl: storageUrl,
          imageKey: fileKey,
          model: result.model,
          width: result.width,
          height: result.height,
          seed: result.seed,
        });

        return {
          success: true,
          imageUrl: storageUrl,
          prompt: result.prompt,
          model: result.model,
          width: result.width,
          height: result.height,
          seed: result.seed,
        };
      }),

    // Get all generations (no auth required)
    list: publicProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 0;
        const generations = await db.getUserGenerations(
          userId,
          input?.limit
        );
        return generations;
      }),

    // Delete a generation (no auth required)
    delete: publicProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 0;
        await db.deleteGeneration(input.id, userId);
        return { success: true };
      }),

    // Get available models
    models: publicProcedure.query(async () => {
      const models = await getAvailableModels();
      return models;
    }),
  }),
});

export type AppRouter = typeof appRouter;

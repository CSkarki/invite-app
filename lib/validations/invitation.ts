import { z } from "zod";

export const createInvitationSchema = z.object({
  eventName: z.string().trim().min(1, "Event name is required"),
  eventDate: z.string().optional(),
  eventTime: z.string().trim().optional(),
  locationOrLink: z.string().trim().optional(),
  message: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  themeId: z.string().trim().optional(),
  themeConfig: z.record(z.unknown()).optional(),
});

export const updateInvitationSchema = z.object({
  eventName: z.string().trim().min(1).optional(),
  eventDate: z.string().nullable().optional(),
  eventTime: z.string().trim().optional(),
  locationOrLink: z.string().trim().optional(),
  message: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  published: z.boolean().optional(),
  slug: z.string().trim().min(1).optional(),
  themeId: z.string().trim().optional(),
  themeConfig: z.record(z.unknown()).nullable().optional(),
});

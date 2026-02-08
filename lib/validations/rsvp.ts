import { z } from "zod";

export const rsvpSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  attending: z.enum(["yes", "no"], { message: "Please select attending or not" }),
  message: z.string().trim().optional(),
});

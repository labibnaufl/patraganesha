import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  locationType: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).default("OFFLINE"),
  location: z.string().optional(),
  registrationLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  registrationDeadline: z.string().optional(),
  maxParticipants: z.coerce.number().int().positive().optional().nullable(),
  contactPerson: z.string().optional(),
  contactEmail: z
    .string()
    .email("Must be a valid email")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional(),
  requireProof: z.boolean().default(true),
  autoVerify: z.boolean().default(false),
  maxProofsPerUser: z.coerce.number().int().min(1).max(10).default(3),
  tagIds: z.array(z.string()).default([]),
});

export type EventInput = z.infer<typeof eventSchema>;

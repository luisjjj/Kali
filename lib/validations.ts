import { z } from "zod";

export const roomCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z2-9]{3}-[a-z2-9]{3}-[a-z2-9]{3}$/, "That code doesn't look right. Try xxx-xxx-xxx.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Give yourself a name so friends know it's you.")
  .max(40, "Keep it under 40 characters.");

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1, "Give your call a title.").max(120).default("Quick catch-up"),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const tokenRequestSchema = z.object({
  roomCode: roomCodeSchema,
  displayName: displayNameSchema,
});

export const chatMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000, "Keep messages under 2000 characters."),
  senderName: displayNameSchema,
});

export const muteParticipantSchema = z.object({
  roomCode: roomCodeSchema,
  identity: z.string().trim().min(1).max(200),
});

export const removeParticipantSchema = muteParticipantSchema;

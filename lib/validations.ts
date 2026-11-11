import { z } from "zod";
import { isRoomId, normalizeRoomId } from "./room-code";

export const roomCodeSchema = z
  .string()
  .trim()
  .transform((value) => normalizeRoomId(value))
  .refine(
    (value) => isRoomId(value),
    "That room name doesn't look right. Use lowercase letters, numbers, or dashes."
  );

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Give yourself a name so friends know it's you.")
  .max(40, "Keep it under 40 characters.");

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1, "Give your call a title.").max(120).default("Quick catch-up"),
  roomName: z
    .string()
    .trim()
    .max(40, "Keep room names under 40 characters.")
    .optional()
    .nullable(),
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

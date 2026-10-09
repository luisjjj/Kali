// Quiet call limits. The timer stays invisible: no countdown in the UI,
// just a friendly nudge at 55 minutes and an automatic wrap at 60.
export const CALL_LIMIT_MS = 60 * 60 * 1000;
export const CALL_REMINDER_MS = 55 * 60 * 1000;
export const CALL_REMINDER_LEAD_MS = CALL_LIMIT_MS - CALL_REMINDER_MS;

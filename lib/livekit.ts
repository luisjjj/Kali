import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[livekit] ${name} is not set. Add it to .env.local (see .env.example / LIVEKIT_SETUP.md).`
    );
  }
  return value;
}

export function livekitEnv() {
  return {
    url: requiredEnv("LIVEKIT_URL"),
    apiKey: requiredEnv("LIVEKIT_API_KEY"),
    apiSecret: requiredEnv("LIVEKIT_API_SECRET"),
  };
}

let roomService: RoomServiceClient | null = null;

export function getRoomService(): RoomServiceClient {
  if (roomService) return roomService;
  const { url, apiKey, apiSecret } = livekitEnv();
  roomService = new RoomServiceClient(url, apiKey, apiSecret);
  return roomService;
}

export async function signJoinToken(opts: {
  identity: string;
  name: string;
  roomCode: string;
  isHost: boolean;
}): Promise<string> {
  const { apiKey, apiSecret } = livekitEnv();
  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
    ttl: "6h",
    metadata: JSON.stringify({ isHost: opts.isHost, displayName: opts.name }),
  });
  at.addGrant({
    room: opts.roomCode,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    // Derived server-side from meetings.host_user_id. Never from client claims.
    roomAdmin: opts.isHost,
  });
  return at.toJwt();
}

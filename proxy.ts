import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  // Dashboard stays behind login. Meeting + token + chat APIs enforce auth
  // inside each handler so guests can join by link and use chat.
  matcher: ["/dashboard/:path*"],
};

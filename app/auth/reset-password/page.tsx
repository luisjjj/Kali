import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password · Kali",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Something you'll remember this time."
      asideTitle="Fresh password, same rooms"
      asideBody="Set it once and keep the good calls going. Your guest links and chat history don't move."
      bullets={["Takes ten seconds", "Works on every device", "Free while we're little"]}
    >
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />
    </AuthShell>
  );
}

import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password · Kali",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      subtitle="Pop in your email and we'll send a reset link."
      asideTitle="Forgot it? Happens to the best"
      asideBody="One link, a new password, and you're back to your rooms. No support ticket needed."
      bullets={["Reset link expires in an hour", "Your rooms stay right where they are", "Still free while we're little"]}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

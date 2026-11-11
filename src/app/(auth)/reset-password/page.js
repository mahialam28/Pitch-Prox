import ResetPasswordForm from "./components/reset-password-form";

export const metadata = {
  title: "Reset Password | PitchProX",
  description: "Reset your PitchProX account password.",
};

// Link from the password reset email: /reset-password?token=...
export default async function ResetPassword({ searchParams }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : ""} />;
}

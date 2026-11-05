import AcceptInviteForm from "./components/accept-invite-form";

export const metadata = {
  title: "Accept Invite | PitchProX",
  description: "Activate your PitchProX employee account.",
};

// Link from Add Employee: /accept-invite?token=...
export default async function AcceptInvitePage({ searchParams }) {
  const { token } = await searchParams;
  return <AcceptInviteForm token={typeof token === "string" ? token : ""} />;
}

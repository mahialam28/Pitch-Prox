import ActivateForm from "./components/activate-form";

export const metadata = {
  title: "Activate Account | PitchProX",
  description: "Set a password to activate your PitchProX account.",
};

// Link from the User Portal (sales rep): /activate?token=...
export default async function ActivatePage({ searchParams }) {
  const { token } = await searchParams;
  return <ActivateForm token={typeof token === "string" ? token : ""} />;
}

import { redirectIfSignedIn } from "@/lib/auth";
import SignUpForm from "./components/sign-up-form";

export const metadata = {
  title: "Sign Up | PitchProX",
  description: "Create your PitchProX account and start your journey today.",
};

// ?name, ?email prefill the form; ?plan (from "Your Video Is Ready") opens that plan after sign-up
const SignUp = async ({ searchParams }) => {
  await redirectIfSignedIn();
  const params = await searchParams;
  const text = (value) => (typeof value === "string" ? value.slice(0, 255) : "");
  return <SignUpForm initialName={text(params.name)} initialEmail={text(params.email)} plan={/^[a-z0-9-]{1,40}$/.test(text(params.plan)) ? text(params.plan) : ""} />;
};

export default SignUp;

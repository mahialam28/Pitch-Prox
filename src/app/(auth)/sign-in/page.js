import { redirectIfSignedIn } from "@/lib/auth";
import SignInForm from "./components/sign-in-form";

export const metadata = {
  title: "Sign In | PitchProX",
  description: "Sign in to your PitchProX account to access personalized features and tools.",
};

const SignIn = async () => {
  await redirectIfSignedIn();
  return <SignInForm />;
};

export default SignIn;
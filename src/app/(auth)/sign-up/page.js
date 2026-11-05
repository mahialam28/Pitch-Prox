import { redirectIfSignedIn } from "@/lib/auth";
import SignUpForm from "./components/sign-up-form";

export const metadata = {
  title: "Sign Up | PitchProX",
  description: "Create your PitchProX account and start your journey today.",
};

const SignUp = async () => {
  await redirectIfSignedIn();
  return <SignUpForm />;
};

export default SignUp;
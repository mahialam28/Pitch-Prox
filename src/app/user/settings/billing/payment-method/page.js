import { redirect } from "next/navigation";

// Normally unreachable: next.config.mjs redirects this path to Billing (HTTP 307).
export default function PaymentMethodPage() {
  redirect("/user/settings/billing");
}

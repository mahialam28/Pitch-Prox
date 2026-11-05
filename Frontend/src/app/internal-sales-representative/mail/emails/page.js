"use client";

import Wrapper from "@/components/wrappers/wrapper";
import SentEmailsPage from "@/app/user/settings/send-mail/emails/page";

// Staff "Sent Emails": the same live list as the customer one, scoped to the signed-in staff member
export default function StaffSentEmailsPage() {
  return (
    <Wrapper variant="bottomSection" className="w-full">
      <SentEmailsPage />
    </Wrapper>
  );
}

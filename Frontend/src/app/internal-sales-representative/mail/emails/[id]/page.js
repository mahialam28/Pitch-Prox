"use client";

import Wrapper from "@/components/wrappers/wrapper";
import EmailDetailsPage from "@/app/user/settings/send-mail/emails/[id]/page";

export default function StaffEmailDetailsPage() {
  return (
    <Wrapper variant="bottomSection" className="w-full">
      <EmailDetailsPage />
    </Wrapper>
  );
}

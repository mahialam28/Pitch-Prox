"use client";

import NewTemplateForm from "../components/new-template-form";
import { useCanManage } from "../../campaign-api";

// New email template (live)
export default function NewTemplatePage() {
  const canManage = useCanManage();
  return <NewTemplateForm canManage={canManage} />;
}

"use client";

import React from "react";
import NewTemplateForm from "../components/new-template-form";

export default function NewTemplatePage() {
  return <NewTemplateForm backUrl="/super-admin/campaigns-journeys?tab=templates" />;
}

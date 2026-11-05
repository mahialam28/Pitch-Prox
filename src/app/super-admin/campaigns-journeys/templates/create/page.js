"use client";

import React from "react";
import NewTemplateForm from "../components/new-template-form";

export default function CreateTemplatePage() {
  return <NewTemplateForm backUrl="/super-admin/campaigns-journeys?tab=templates" />;
}

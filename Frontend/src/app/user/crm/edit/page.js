"use client";

import { usePortal } from "@/components/shared/use-portal";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProspectForm from "../components/prospect-form";
import { apiRequest } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";

function EditProspectForm() {
  const portal = usePortal();
  const router = useRouter();
  const prospectId = useSearchParams().get("id");
  const [prospect, setProspect] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!prospectId) return;
    let active = true;
    apiRequest(`/api/v1/crm/prospects/${encodeURIComponent(prospectId)}`)
      .then((data) => active && setProspect(data.prospect))
      .catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, [prospectId]);

  const saveProspect = async (values) => {
    try {
      await apiRequest(`/api/v1/crm/prospects/${encodeURIComponent(prospectId)}`, { method: "PATCH", body: values });
    } catch (err) {
      await showError("Prospect not updated", err.message);
      throw err;
    }
    await showSuccess("Prospect updated", "Your changes have been saved.");
    router.push(`${portal.base}/crm`);
  };

  if (!prospect) {
    const message = !prospectId ? "No prospect was selected." : error || "Loading prospect…";
    return (
      <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-8 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-semibold text-dark-black/80">{message}</p>
        {(!prospectId || error) && (
          <Link href={`${portal.base}/crm`} className="text-xs font-semibold text-primary hover:underline">
            Back to CRM
          </Link>
        )}
      </div>
    );
  }

  return (
    <ProspectForm
      initialValues={prospect}
      title="Edit Prospect"
      description="Update the details for this prospect."
      submitLabel="Update Prospect"
      onSubmit={saveProspect}
    />
  );
}

export default function EditProspectPage() {
  return (
    <Suspense fallback={null}>
      <EditProspectForm />
    </Suspense>
  );
}

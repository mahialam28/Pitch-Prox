"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, ExternalLink, Trash2, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { DesignEditor, DesignPreview, HtmlEditor, HtmlPreview, TemplateDetails } from "./template-setup";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { campaignApi } from "../../campaign-api";

const BUTTON_COLORS = ["#0EADAB", "#059669", "#2563EB", "#7C3AED", "#EA580C", "#DC2626", "#0F172A"];
const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

// Create or edit an email template (lib/campaigns/templates). Fields every template has (item 292),
// then the editor for the chosen Creation Method. `initialTemplate` is an API template when editing.
export default function NewTemplateForm({ initialTemplate = null, canManage = true, backUrl = "/super-admin/campaigns-journeys?tab=templates" }) {
  const router = useRouter();
  const editing = Boolean(initialTemplate);
  const content = initialTemplate?.content ?? {};

  const [method, setMethod] = useState(initialTemplate?.creationMethod ?? "build");
  const [subject, setSubject] = useState(initialTemplate?.subject ?? "");
  const [details, setDetails] = useState({
    name: initialTemplate?.name ?? "",
    emailType: initialTemplate?.emailType ?? "Lifecycle",
    category: initialTemplate?.category ?? "Onboarding",
    status: initialTemplate?.status ?? "Draft",
    preheader: initialTemplate?.preheader ?? "",
    fromName: initialTemplate?.fromName ?? "PitchProX",
    replyTo: initialTemplate?.replyTo ?? "",
    triggerEvent: initialTemplate?.triggerEvent ?? "",
  });
  // Build in PitchProX
  const [heading, setHeading] = useState(content.heading ?? "");
  const [bodyCopy, setBodyCopy] = useState(content.body ?? "Hi {First Name},\n\n");
  const [buttonLabel, setButtonLabel] = useState(content.buttonLabel ?? "Open PitchProX");
  const [buttonUrl, setButtonUrl] = useState(content.buttonUrl ?? "{App Link}");
  const [buttonColor, setButtonColor] = useState(content.buttonColor ?? "#0EADAB");
  // Upload Design
  const [designImages, setDesignImages] = useState(() => (content.images ?? []).map((image) => ({ ...image, id: image.assetId, url: `/api/v1/public/campaign-assets/${image.assetId}` })));
  const [cta, setCta] = useState(content.cta?.on ? content.cta : { on: false, label: "Learn More", url: "https://", color: "#0EADAB" });
  // Upload HTML
  const [htmlFile, setHtmlFile] = useState(initialTemplate?.html ? { name: "Current HTML", source: initialTemplate.html, saved: true } : null);
  const [saving, setSaving] = useState(false);

  const save = async (statusOverride) => {
    if (!details.name.trim()) return toast.error("Please give the template a name");
    if (!subject.trim()) return toast.error("Please provide a subject line");
    if (method === "design" && !designImages.length) return toast.error("Upload at least one design image");
    if (method === "design" && designImages.some((image) => !image.alt?.trim())) return toast.error("Add alt text to every design image");
    if (method === "html" && !htmlFile) return toast.error("Upload the HTML email file");
    if (method === "build" && (!heading.trim() || !bodyCopy.trim())) return toast.error("Add a heading and the email text");

    const body = {
      ...details,
      status: statusOverride ?? details.status,
      triggerEvent: details.emailType === "Transactional" ? details.triggerEvent || null : null,
      subject,
      creationMethod: method,
      ...(method === "build" && { content: { heading, body: bodyCopy, buttonLabel, buttonUrl, buttonColor } }),
      ...(method === "design" && { content: { images: designImages.map(({ assetId, alt, link }) => ({ assetId, alt, link: link || null })), cta } }),
      ...(method === "html" && !htmlFile.saved && { html: htmlFile.source }),
    };
    if (editing) delete body.creationMethod;
    setSaving(true);
    try {
      const result = editing ? await campaignApi.updateTemplate(initialTemplate.id, body) : await campaignApi.createTemplate(body);
      toast.success(`Template ${editing ? "saved" : "created"} (${result.template.status}).`);
      router.push(backUrl);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    try {
      const result = await campaignApi.duplicateTemplate(initialTemplate.id);
      toast.success("Copy created as a Draft.");
      router.push(`/super-admin/campaigns-journeys/templates/${result.template.id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const remove = async () => {
    if (!window.confirm(`Delete "${initialTemplate.name}"? Templates that have been used are archived instead.`)) return;
    try {
      const result = await campaignApi.deleteTemplate(initialTemplate.id);
      toast.success(result.archived ? "Template archived (it has been used)." : "Template deleted.");
      router.push(backUrl);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 min-w-0 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link href={backUrl} className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Email Templates</span>
        </Link>
        {editing && (
          <div className="flex items-center gap-2">
            <a href={`/api/v1/campaigns/templates/${initialTemplate.id}/preview`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black/80 hover:bg-light-gray">
              <ExternalLink className="w-3.5 h-3.5" /> Preview saved email
            </a>
            {canManage && (
              <>
                <button type="button" onClick={duplicate} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black/80 hover:bg-light-gray cursor-pointer">
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-1">
        <Title variant="small" className="!text-dark-black font-bold text-xl sm:text-2xl font-secondary">
          {editing ? initialTemplate.name : "New Email Template"}
        </Title>
        <Text variant="small" className="text-light-black">
          {editing ? `Used in ${initialTemplate.stats?.queued + initialTemplate.stats?.sent || 0} emails so far.` : "Templates are reusable in broadcast campaigns and lifecycle journeys."}
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        <div className="lg:col-span-6 bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-xs flex flex-col gap-5 w-full">
          <div className="flex items-center justify-between pb-2 border-b border-light-gray/60">
            <h2 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">Template Configuration</h2>
          </div>

          <TemplateDetails method={method} onMethod={setMethod} methodLocked={editing} details={details} onDetails={setDetails} subject={subject} onSubject={setSubject} />

          {method === "design" && <DesignEditor images={designImages} onImages={setDesignImages} cta={cta} onCta={setCta} />}
          {method === "html" && <HtmlEditor html={htmlFile} onHtml={setHtmlFile} />}
          {method === "build" && (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-dark-black/85">Heading</span>
                <input value={heading} onChange={(event) => setHeading(event.target.value)} maxLength={200} placeholder="Welcome to PitchProX!" className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-dark-black/85">Email Text</span>
                <textarea value={bodyCopy} onChange={(event) => setBodyCopy(event.target.value)} rows={8} maxLength={20000} className={`${inputClass} resize-y`} />
                <span className="text-[11px] text-light-black">A blank line starts a new paragraph.</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-dark-black/85">Button Label</span>
                  <input value={buttonLabel} onChange={(event) => setButtonLabel(event.target.value)} maxLength={60} placeholder="Leave empty for no button" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-dark-black/85">Button Link</span>
                  <input value={buttonUrl} onChange={(event) => setButtonUrl(event.target.value)} placeholder="https://… or {App Link}" className={inputClass} />
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-dark-black/85">Button Color</span>
                <div className="flex items-center gap-2">
                  {BUTTON_COLORS.map((color) => (
                    <button key={color} type="button" aria-label={`Button color ${color}`} onClick={() => setButtonColor(color)} className={`w-7 h-7 rounded-full border-2 cursor-pointer ${buttonColor === color ? "border-dark-black" : "border-white shadow-xs"}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-xs flex flex-col gap-4 sticky top-4 w-full">
          <div className="flex items-center justify-between pb-2 border-b border-light-gray/60">
            <h2 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">Live Preview</h2>
            <span className="text-[11px] text-light-black font-medium">Merge fields fill in per person</span>
          </div>
          <div className="flex items-center gap-2 text-xs pb-1">
            <span className="text-light-black font-normal">Subject:</span>
            <span className="text-dark-black/90 font-medium truncate">{subject || "No subject yet"}</span>
          </div>
          {details.preheader && <p className="text-[11px] text-light-black -mt-3">{details.preheader}</p>}
          <div className="w-full rounded-2xl border border-light-gray/80 overflow-hidden bg-white shadow-2xs">
            <div className="bg-[#F8FAFC] border-b border-light-gray/60 px-4 py-2.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
            </div>
            {method === "design" && <DesignPreview images={designImages} cta={cta} />}
            {method === "html" && <HtmlPreview html={htmlFile} />}
            {method === "build" && (
              <div className="bg-[#FAFAFA]/40">
                <div className="bg-primary px-6 py-4 flex items-center gap-2 text-white font-bold">
                  <Zap className="w-4 h-4 fill-white" /> PitchProX
                </div>
                <div className="p-6 sm:p-7 flex flex-col gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-dark-black leading-snug tracking-tight">{heading || "Your heading"}</h3>
                  <p className="text-xs text-medium-black leading-relaxed whitespace-pre-line">{bodyCopy}</p>
                  {buttonLabel && buttonUrl && (
                    <div className="pt-2 flex justify-center">
                      <span style={{ backgroundColor: buttonColor }} className="inline-flex px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white">{buttonLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {details.emailType !== "Transactional" && <p className="text-[11px] text-light-black">An unsubscribe link is added to the footer of {details.emailType} emails.</p>}
        </div>
      </div>

      {canManage && (
        <div className="w-full bg-white rounded-2xl border border-light-gray p-4 sm:p-5 shadow-xs flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.push(backUrl)} className="px-5 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs">
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={() => save("Draft")} className="px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-60">
            Save as Draft
          </button>
          <button type="button" disabled={saving} onClick={() => save()} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60">
            {saving ? "Saving…" : `Save (${details.status})`}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import { Upload, Trash2, ArrowUp, ArrowDown, FileCode, Image as ImageIcon, Wrench } from "lucide-react";
import toast from "react-hot-toast";

// Template options (client spec, Nov 2026)
export const CREATION_METHODS = [
  { value: "build", label: "Build in PitchProX", icon: Wrench, hint: "Use the step-by-step builder." },
  { value: "design", label: "Upload Design", icon: ImageIcon, hint: "PNG or JPG images, e.g. a design made in Canva." },
  { value: "html", label: "Upload HTML", icon: FileCode, hint: "A complete HTML email file." },
];
export const EMAIL_TYPES = [
  { value: "Marketing", hint: "Product announcements, promotions, general campaigns, re-engagement." },
  { value: "Lifecycle", hint: "Trial welcome, trial ending, calibration reminder, inactive user recovery, usage warning, call limit reached, upgrade prompt, feature adoption." },
  { value: "Transactional", hint: "Payment processed or failed, update payment method, subscription confirmation or cancellation, invoice / receipt. Sent from system events." },
];
export const TEMPLATE_CATEGORIES = ["Onboarding", "Trial", "Billing", "Usage", "Product", "Retention", "Account", "Announcement", "Promotional"];
export const TEMPLATE_STATUSES = ["Draft", "Active", "Archived"];

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
const Field = ({ label, children, hint }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-dark-black/85">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-light-black">{hint}</span>}
  </label>
);

// Creation Method (first) + the fields every template has
export function TemplateDetails({ method, onMethod, details, onDetails, subject, onSubject }) {
  const set = (key) => (event) => onDetails({ ...details, [key]: event.target.value });
  const emailTypeHint = EMAIL_TYPES.find((type) => type.value === details.emailType)?.hint;
  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-light-gray/60">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-dark-black/85">Creation Method</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Creation Method">
          {CREATION_METHODS.map((option) => {
            const Icon = option.icon;
            const active = method === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onMethod(option.value)}
                className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${active ? "border-primary bg-primary/5" : "border-light-gray hover:border-primary/40"}`}
              >
                <span className={`flex items-center gap-1.5 text-xs font-bold ${active ? "text-primary" : "text-dark-black/85"}`}>
                  <Icon className="w-3.5 h-3.5" /> {option.label}
                </span>
                <span className="block text-[11px] text-light-black mt-1 leading-snug">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Template Name">
          <input value={details.name} onChange={set("name")} placeholder="e.g. Trial Welcome" className={inputClass} />
        </Field>
        <Field label="Email Type" hint={emailTypeHint}>
          <select value={details.emailType} onChange={set("emailType")} className={inputClass}>
            {EMAIL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.value}</option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select value={details.category} onChange={set("category")} className={inputClass}>
            {TEMPLATE_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={details.status} onChange={set("status")} className={inputClass}>
            {TEMPLATE_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Field label="Subject Line">
          <input value={subject} onChange={(event) => onSubject(event.target.value)} placeholder="Welcome to PitchProX! Let's get you started" className={inputClass} />
        </Field>
        <Field label="Preheader">
          <input value={details.preheader} onChange={set("preheader")} placeholder="Short preview text shown after the subject" className={inputClass} />
        </Field>
        <Field label="From Name">
          <input value={details.fromName} onChange={set("fromName")} placeholder="PitchProX" className={inputClass} />
        </Field>
        <Field label="Reply-To Email">
          <input type="email" value={details.replyTo} onChange={set("replyTo")} placeholder="support@pitchprox.com" className={inputClass} />
        </Field>
      </div>
    </div>
  );
}

// Upload Design: images stacked top to bottom, each with alt text and an optional link; optional CTA below
export function DesignEditor({ images, onImages, cta, onCta }) {
  const inputRef = useRef(null);
  const add = (event) => {
    const files = Array.from(event.target.files ?? []).filter((file) => /image\/(png|jpe?g)/.test(file.type));
    event.target.value = "";
    if (!files.length) {
      toast.error("Choose PNG or JPG images.");
      return;
    }
    onImages([...images, ...files.map((file) => ({ id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 6)}`, name: file.name, url: URL.createObjectURL(file), alt: "", link: "" }))]);
  };
  const update = (id, changes) => onImages(images.map((image) => (image.id === id ? { ...image, ...changes } : image)));
  const move = (index, direction) => {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(index + direction, 0, item);
    onImages(next);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-dark-black/85">Design Images</span>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={add} />
        <button type="button" onClick={() => inputRef.current?.click()} className="w-full py-5 rounded-xl border-2 border-dashed border-light-gray hover:border-primary/50 text-xs font-semibold text-medium-black flex flex-col items-center gap-1.5 cursor-pointer">
          <Upload className="w-5 h-5 text-primary" />
          Upload PNG or JPG (you can add several; they stack top to bottom)
        </button>
        <span className="text-[11px] text-light-black">PDFs can&apos;t be used as an email body. Export your Canva design as PNG or JPG.</span>
      </div>
      {images.map((image, index) => (
        <div key={image.id} className="flex gap-3 p-3 rounded-xl border border-light-gray">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt="" className="w-16 h-16 rounded-lg object-cover bg-light-gray shrink-0" />
          <div className="flex-1 min-w-0 grid grid-cols-1 gap-2">
            <input value={image.alt} onChange={(event) => update(image.id, { alt: event.target.value })} placeholder="Alt Text (describe the image)" aria-label={`Alt text for ${image.name}`} className={inputClass} />
            <input value={image.link} onChange={(event) => update(image.id, { link: event.target.value })} placeholder="Destination Link (optional)" aria-label={`Destination link for ${image.name}`} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up" className="p-1.5 rounded-lg border border-light-gray disabled:opacity-40 cursor-pointer"><ArrowUp className="w-3.5 h-3.5" /></button>
            <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} aria-label="Move down" className="p-1.5 rounded-lg border border-light-gray disabled:opacity-40 cursor-pointer"><ArrowDown className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => onImages(images.filter((item) => item.id !== image.id))} aria-label="Remove image" className="p-1.5 rounded-lg border border-light-gray text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}

      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-xs font-bold text-dark-black/85">CTA Button Below Design</span>
        <input type="checkbox" checked={cta.on} onChange={(event) => onCta({ ...cta, on: event.target.checked })} className="accent-primary w-4 h-4" />
      </label>
      {cta.on && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Button Label"><input value={cta.label} onChange={(event) => onCta({ ...cta, label: event.target.value })} className={inputClass} /></Field>
          <Field label="Destination URL"><input value={cta.url} onChange={(event) => onCta({ ...cta, url: event.target.value })} className={inputClass} /></Field>
          <Field label="Button Style / Color"><input type="color" value={cta.color} onChange={(event) => onCta({ ...cta, color: event.target.value })} className="h-10 w-full rounded-xl border border-light-gray cursor-pointer" /></Field>
        </div>
      )}
    </div>
  );
}

export function DesignPreview({ images, cta }) {
  return (
    <div className="bg-white">
      {images.length ? (
        images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={image.id} src={image.url} alt={image.alt || ""} className="block w-full" />
        ))
      ) : (
        <p className="p-10 text-center text-xs text-light-black">Upload your design images to preview them here.</p>
      )}
      {cta.on && (
        <div className="p-5 flex justify-center">
          <span className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: cta.color }}>{cta.label || "Learn More"}</span>
        </div>
      )}
    </div>
  );
}

// Upload HTML: a complete HTML email file
export function HtmlEditor({ html, onHtml }) {
  const inputRef = useRef(null);
  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/\.html?$/i.test(file.name)) {
      toast.error("Choose an .html file.");
      return;
    }
    onHtml({ name: file.name, source: await file.text() });
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-dark-black/85">HTML Email File</span>
      <input ref={inputRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={pick} />
      <button type="button" onClick={() => inputRef.current?.click()} className="w-full py-5 rounded-xl border-2 border-dashed border-light-gray hover:border-primary/50 text-xs font-semibold text-medium-black flex flex-col items-center gap-1.5 cursor-pointer">
        <FileCode className="w-5 h-5 text-primary" />
        {html?.name ? `Replace ${html.name}` : "Upload a complete HTML email file"}
      </button>
    </div>
  );
}

export function HtmlPreview({ html }) {
  return html?.source ? (
    <iframe title="HTML email preview" sandbox="" srcDoc={html.source} className="w-full h-[480px] bg-white border-0" />
  ) : (
    <p className="p-10 text-center text-xs text-light-black">Upload an HTML file to preview it here.</p>
  );
}

// ── AI training categories ──
// The upload cards on /user/ai-training; the API only accepts these ids.
export const TRAINING_CATEGORIES = [
  { id: "sales-bio", title: "Sales Bio" },
  { id: "company-info", title: "Company Info" },
  { id: "scripts-flows", title: "Scripts & Flows" },
  { id: "objections", title: "Objections" },
  { id: "marketing-presentation", title: "Marketing & Listing Presentation" },
  { id: "past-sales", title: "Past Sales Data" },
  { id: "other-resources", title: "Other Resources" },
];

// File types accepted for training material, grouped by the label shown in the table
export const TRAINING_FILE_TYPES = {
  PDF: ["pdf"],
  Doc: ["doc", "docx", "txt", "rtf", "odt"],
  Slides: ["ppt", "pptx", "key", "odp"],
  Sheet: ["xls", "xlsx", "csv"],
  Video: ["mp4", "mov", "webm"],
  Audio: ["mp3", "wav", "m4a"],
  Image: ["png", "jpg", "jpeg", "webp"],
};

export const TRAINING_MAX_BYTES = 50 * 1024 * 1024;

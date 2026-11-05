"use client";

import React, { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import Text from "@/components/texts/text";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
import { TICKET_CATEGORIES as categoryOptions, TICKET_PRIORITIES as priorityOptions } from "@/utils.js/support";
import { TICKETS_CHANGED } from "./use-tickets";

export default function SupportForm() {
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success("File attached");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in subject and description");
      return;
    }
    const form = new FormData();
    form.append("category", category);
    form.append("priority", priority);
    form.append("subject", subject);
    form.append("description", description);
    if (file) form.append("file", file);
    setSaving(true);
    try {
      const { ticket } = await apiRequest("/api/v1/support/tickets", { method: "POST", body: form });
      toast.success(`Ticket #TKT-${ticket.number} created. Our team will reply here.`);
      setSubject("");
      setDescription("");
      setFile(null);
      window.dispatchEvent(new Event(TICKETS_CHANGED));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full w-full min-w-0 bg-white rounded-2xl border border-light-gray p-6 shadow-sm flex flex-col">
      <div className="mb-5">
        <Text variant="regular" className="font-bold text-dark-black">
          Create a new ticket
        </Text>
        <Text variant="smaller" className="mt-0.5 text-light-black leading-relaxed">
          Our support team is here to help. Please provide as much detail as
          possible.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col grow">
        {/* Category & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-medium-black mb-1.5">
              Category
            </label>
            <Dropdown
              label="Select a category"
              items={categoryOptions}
              selected={category}
              onSelect={setCategory}
              className="w-full"
            />
          </div>

          {/* Priority Dropdown */}
          <div>
            <label className="block text-sm font-medium text-medium-black mb-1.5">
              Priority
            </label>
            <Dropdown
              label="Select priority"
              items={priorityOptions}
              selected={priority}
              onSelect={setPriority}
              className="w-full"
            />
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-medium-black">Subject</label>
          <input
            type="text"
            placeholder="Enter a short description"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-all duration-200"
            required
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-medium-black">
            Describe your issue
          </label>
          <textarea
            rows={6}
            placeholder="Provide as much detail as possible..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black resize-none transition-all duration-200"
            required
          />
        </div>

        {/* File Drag & Drop Upload */}
        <label className="flex items-center gap-3 p-3.5 border border-dashed border-light-gray rounded-xl bg-light-gray/50 hover:bg-light-gray hover:border-primary/40 cursor-pointer transition-all duration-200 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-light-gray text-light-black group-hover:text-primary transition-colors shrink-0">
            <Paperclip className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-dark-black truncate">
              {file ? file.name : "Attach a screenshot or file (optional)"}
            </p>
            <p className="text-[10px] text-light-black mt-0.5">
              Images, PDF, documents or logs up to 10MB
            </p>
          </div>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.log,.csv,.doc,.docx,.xls,.xlsx,.zip"
            className="hidden"
          />
        </label>

        {/* Create Ticket Button */}
        <button
          type="submit"
          disabled={saving}
          className="mt-auto w-full flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{saving ? "Creating…" : "Create Ticket"}</span>
        </button>
      </form>
    </div>
  );
}

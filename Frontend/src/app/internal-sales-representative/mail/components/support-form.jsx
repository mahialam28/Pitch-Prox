"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Send, Search, User, Check, X } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";

const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");

const categoryOptions = [
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing & Plans" },
  { value: "account", label: "Account Access" },
  { value: "feature", label: "Feature Request" },
];

const priorityOptions = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent" },
];

// Opens a support ticket for one of the rep's customers (POST /api/v1/staff/tickets)
export const SupportForm = ({ onTicketCreated }) => {
  const [customersList, setCustomersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef(null);

  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/customers")
      .then(({ results }) => {
        if (!cancelled) setCustomersList(results.map((account) => ({ id: account.organizationId, name: account.name, company: account.company, email: account.email, avatar: initials(account.name) })));
      })
      .catch((error) => toast.error(`Customers not loaded: ${error.message}`));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customersList.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.company.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!selectedCustomer) {
      toast.error("Choose the customer this ticket is for.");
      return;
    }
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in the subject and description.");
      return;
    }
    const form = new FormData();
    form.append("organizationId", selectedCustomer.id);
    form.append("category", category);
    form.append("priority", priority);
    form.append("subject", subject);
    form.append("description", description);
    if (file) form.append("file", file);
    setSaving(true);
    let ticket;
    try {
      ({ ticket } = await apiRequest("/api/v1/staff/tickets", { method: "POST", body: form }));
    } catch (error) {
      toast.error(error.message);
      return;
    } finally {
      setSaving(false);
    }
    onTicketCreated?.(ticket);
    toast.success(`Support ticket #${ticket.reference} created for ${selectedCustomer.company}.`);
    setSubject("");
    setDescription("");
    setFile(null);
  };

  return (
    <div className="h-full w-full min-w-0 bg-white rounded-2xl border border-light-gray p-4 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="mb-5">
          <h2 className="text-base sm:text-lg font-bold text-dark-black tracking-tight">
            Create a new ticket
          </h2>
          <p className="text-xs text-light-black mt-0.5 leading-relaxed">
            Our support team is here to help. Please provide as much detail as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          {/* ── Search & Select Customer ── */}
          <div className="space-y-1 relative" ref={customerDropdownRef}>
            <label className="block text-xs font-semibold text-medium-black">
              Search & Select Customer
            </label>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-2.5 bg-light-gray/40 border border-light-gray rounded-xl hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {selectedCustomer.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-dark-black truncate">
                      {selectedCustomer.name}{" "}
                      <span className="text-[11px] font-normal text-light-black">
                        ({selectedCustomer.company})
                      </span>
                    </p>
                    <p className="text-[10px] text-light-black truncate">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsCustomerDropdownOpen(true);
                  }}
                  className="px-2 py-1 text-[11px] font-semibold text-primary hover:text-medium-teal cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-black">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Search customer by name, email, or company..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
                />

                {isCustomerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-lg z-30 max-h-52 overflow-y-auto p-1 divide-y divide-light-gray/40">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setIsCustomerDropdownOpen(false);
                            setCustomerSearch("");
                          }}
                          className="flex items-center justify-between p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {cust.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-dark-black truncate">
                                {cust.name}
                              </p>
                              <p className="text-[10px] text-light-black truncate">
                                {cust.company} • {cust.email}
                              </p>
                            </div>
                          </div>
                          {selectedCustomer?.id === cust.id && (
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-light-black">
                        No customers found matching &quot;{customerSearch}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-medium-black">
                Category
              </label>
              <Dropdown
                label="Select Category"
                items={categoryOptions}
                selected={category}
                onSelect={setCategory}
                className="w-full"
              />
            </div>

            {/* Priority Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-medium-black">
                Priority
              </label>
              <Dropdown
                label="Select Priority"
                items={priorityOptions}
                selected={priority}
                onSelect={setPriority}
                className="w-full"
              />
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-medium-black">
              Subject
            </label>
            <input
              type="text"
              placeholder="Enter a short description"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
              required
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-medium-black">
              Describe your issue
            </label>
            <textarea
              rows={6}
              placeholder="Provide as much detail as possible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black resize-none transition-colors"
              required
            />
          </div>

          {/* File Upload Attachment */}
          <label className="flex items-center gap-3 p-3.5 border border-dashed border-light-gray rounded-xl bg-light-gray/40 hover:bg-light-gray hover:border-primary/40 cursor-pointer transition-all group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-light-gray text-light-black group-hover:text-primary transition-colors shrink-0">
              <Paperclip className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-dark-black truncate">
                {file ? file.name : "Attach a screenshot or file (optional)"}
              </p>
              <p className="text-[10px] text-light-black mt-0.5">
                JPG, PNG, PDF up to 10MB
              </p>
            </div>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-wait"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? "Creating…" : "Create Ticket"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportForm;

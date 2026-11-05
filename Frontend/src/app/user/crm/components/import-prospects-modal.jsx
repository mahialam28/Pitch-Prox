"use client";

import React, { useRef, useState } from "react";
import { Check, Download, FileText, Upload, X } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";

const MAX_ROWS = 5000;
const MAX_BYTES = 10 * 1024 * 1024;
const TEMPLATE_HEADERS = ["Full Name", "Phone Number", "Email", "Property Address", "City", "State", "Zip Code", "Lead Type", "Lead Stage", "Status", "Outcome"];

// CSV header (lower-case) → prospect field
const HEADER_MAP = {
  "full name": "name",
  name: "name",
  "phone number": "phoneNumber",
  phone: "phoneNumber",
  email: "email",
  "property address": "propertyAddress",
  address: "propertyAddress",
  city: "city",
  state: "state",
  "zip code": "zipCode",
  zip: "zipCode",
  "lead type": "leadType",
  "lead stage": "stage",
  stage: "stage",
  status: "status",
  outcome: "outcome",
};

const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
};

const parseCsv = (text) => {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((header) => HEADER_MAP[header.trim().toLowerCase()]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((field, index) => {
      if (field && cells[index]?.trim()) row[field] = cells[index].trim();
    });
    return row;
  });
};

const parseJson = (text) => {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.prospects || [];
  return list.map((item) => ({
    name: item.name || item.fullName,
    phoneNumber: item.phoneNumber || item.phone,
    email: item.email,
    propertyAddress: item.propertyAddress,
    city: item.city,
    state: item.state,
    zipCode: item.zipCode,
    leadType: item.leadType,
    stage: item.stage,
    status: item.status,
    outcome: item.outcome,
  }));
};

const digits = (value) => String(value || "").replace(/\D/g, "");

const downloadTemplate = () => {
  const example = ["Jane Cooper", "(555) 123-4567", "jane@example.com", "12 Oak Street", "Austin", "TX", "78701", "", "New", "Unknown", ""];
  const csv = `${TEMPLATE_HEADERS.join(",")}\n${example.map((value) => `"${value}"`).join(",")}\n`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: "pitchprox-prospects-template.csv" }).click();
  URL.revokeObjectURL(url);
};

const Checkbox = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 transition-colors">
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </span>
    <span className="text-sm text-medium-black">{children}</span>
  </label>
);

const ImportProspectsModal = ({ isOpen, onClose, existingProspects = [], onImport }) => {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [addToFollowUp, setAddToFollowUp] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setRows([]);
    setError("");
  };

  const close = () => {
    if (importing) return;
    reset();
    onClose();
  };

  const readFile = async (chosen) => {
    if (!chosen) return;
    reset();
    const lower = chosen.name.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".json")) {
      setError("Choose a .csv file (or a .json export).");
      return;
    }
    if (chosen.size > MAX_BYTES) {
      setError("The file is larger than 10 MB.");
      return;
    }
    try {
      const text = await chosen.text();
      const parsed = (lower.endsWith(".json") ? parseJson(text) : parseCsv(text)).filter((row) => row.name);
      if (!parsed.length) {
        setError("No prospects found. Make sure the first row has the column names and each row has a Full Name.");
        return;
      }
      if (parsed.length > MAX_ROWS) {
        setError(`The file has ${parsed.length} rows. Import up to ${MAX_ROWS.toLocaleString()} at a time.`);
        return;
      }
      setFile(chosen);
      setRows(parsed);
    } catch {
      setError("This file couldn't be read. Check that it is a valid CSV file.");
    }
  };

  // Rows that will actually be sent, after skipping duplicate phone numbers
  const toImport = (() => {
    if (!skipDuplicates) return rows;
    const seen = new Set(existingProspects.map((prospect) => digits(prospect.phoneNumber)).filter(Boolean));
    return rows.filter((row) => {
      const phone = digits(row.phoneNumber);
      if (!phone) return true;
      if (seen.has(phone)) return false;
      seen.add(phone);
      return true;
    });
  })();
  const skipped = rows.length - toImport.length;

  const runImport = async () => {
    setImporting(true);
    try {
      await onImport(toImport, { addToFollowUp });
      reset();
      onClose();
    } finally {
      setImporting(false);
    }
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={close}
      title="Import Prospects"
      subtitle="Upload a CSV file to add prospects in bulk."
      size="lg"
      footer={
        <>
          <DialogButton onClick={close} disabled={importing}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={runImport} disabled={importing || !toImport.length}>
            {importing ? "Importing…" : toImport.length ? `Import ${toImport.length}` : "Import"}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-medium-teal cursor-pointer">
          <Download className="w-4 h-4" /> Download CSV template
        </button>

        {file ? (
          <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3">
            <FileText className="w-5 h-5 text-dark-black/70 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-black truncate">{file.name}</p>
              <p className="text-xs text-medium-black mt-0.5">
                {rows.length} prospect{rows.length === 1 ? "" : "s"} found
                {skipped > 0 && ` · ${skipped} duplicate${skipped === 1 ? "" : "s"} will be skipped`}
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              disabled={importing}
              onClick={reset}
              className="p-1 rounded-md text-dark-black/70 hover:text-dark-black hover:bg-light-gray cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              readFile(event.dataTransfer.files?.[0]);
            }}
            className={`w-full flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border border-dashed transition-colors cursor-pointer ${
              dragging ? "border-primary bg-light-teal/40" : "border-gray-300 bg-[#f2f4f6] hover:border-primary/60"
            }`}
          >
            <Upload className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-dark-black">
              Drag and drop your CSV here, or <span className="text-primary">browse</span>
            </span>
            <span className="text-xs text-medium-black">CSV · up to 5,000 rows · max 10 MB</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          className="hidden"
          onChange={(event) => {
            readFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="bg-[#f2f4f6] rounded-xl p-4">
          <p className="text-xs font-medium text-dark-black">Required columns</p>
          <p className="text-xs text-medium-black mt-1">Full Name, Phone Number, Property Address, City, State, Zip Code, Lead Type</p>
        </div>

        <div className="space-y-3">
          <Checkbox checked={skipDuplicates} onChange={setSkipDuplicates}>Skip duplicate phone numbers</Checkbox>
          <Checkbox checked={addToFollowUp} onChange={setAddToFollowUp}>
            Add imported prospects to follow up queue (tomorrow, 9:00 AM)
          </Checkbox>
        </div>
      </div>
    </DialogModal>
  );
};

export default ImportProspectsModal;

"use client";

import React, { useState } from "react";
import { CircleCheck, Search, UserCog, UserPlus } from "lucide-react";
import DialogModal, { DialogButton } from "./dialog-modal";
import { Select } from "@/app/super-admin/users/[id]/components/account-dialogs";

// Reassign a support ticket to another agent (design only: the caller updates local state).

const AGENTS = [
  { name: "Alex Turner", role: "Support Agent", open: 8, available: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" },
  { name: "Jessica Lee", role: "Senior Support Agent", open: 4, available: true, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" },
  { name: "Mike Davis", role: "Support Agent", open: 6, available: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" },
  { name: "Sarah Johnson", role: "Billing Specialist", open: 3, available: false, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
];

const REASONS = ["Workload balancing", "Needs specialist knowledge", "Agent unavailable", "Customer request", "Other"];

const AgentRow = ({ agent, selected, onSelect, as = "button" }) => {
  const Tag = as;
  return (
    <Tag
      {...(as === "button" ? { type: "button", onClick: onSelect, role: "radio", "aria-checked": selected } : {})}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left ${as === "button" ? "cursor-pointer" : ""} ${
        selected ? "bg-light-teal/40 border-l-4 border-primary" : as === "button" ? "hover:bg-light-gray/60 border-l-4 border-transparent" : ""
      }`}
    >
      {agent.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={agent.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <span className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{agent.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-dark-black">{agent.name}</span>
        <span className="block text-[11px] text-medium-black">{agent.role}</span>
      </span>
      <span className="text-right">
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${agent.available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {agent.available ? "Available" : "Busy"}
        </span>
        <span className="block text-[10px] text-medium-black mt-0.5">{agent.open} open tickets</span>
      </span>
      {selected && <CircleCheck className="w-5 h-5 text-white fill-primary shrink-0" />}
    </Tag>
  );
};

// agents: [{ id, name, role, open, available, avatar? }] (defaults to sample agents)
const ReassignTicketModal = ({ isOpen, onClose, ticketId, subject, currentAgentName, onReassign, agents = AGENTS }) => {
  const current = agents.find((agent) => agent.name === currentAgentName) ?? { name: currentAgentName || "Unassigned", role: "Current owner", open: 0, available: true };
  const others = agents.filter((agent) => agent.name !== current.name);
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState(others[0]?.name);
  const [reason, setReason] = useState(REASONS[0]);
  const [notify, setNotify] = useState(true);

  const visible = others.filter((agent) => `${agent.name} ${agent.role}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = others.find((agent) => agent.name === selectedName);

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5">
          <UserCog className="w-6 h-6 text-primary" /> Reassign Ticket
        </span>
      }
      subtitle={`Ticket ${ticketId} • ${subject}`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={!selected}
            onClick={() => {
              onReassign?.(selected, { reason, notify });
              onClose();
            }}
          >
            <UserPlus className="w-4 h-4" /> Reassign Ticket
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-dark-black mb-2">Current Assignee</p>
          <div className="rounded-xl border border-light-gray overflow-hidden">
            <AgentRow agent={current} as="div" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-dark-black mb-2">Reassign To</p>
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-medium-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              aria-label="Search agents"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search agents by name, team, or role..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm outline-none focus:border-primary"
            />
          </div>
          <div role="radiogroup" aria-label="Agents" className="rounded-xl border border-light-gray divide-y divide-light-gray overflow-hidden">
            {visible.length ? (
              visible.map((agent) => <AgentRow key={agent.name} agent={agent} selected={agent.name === selectedName} onSelect={() => setSelectedName(agent.name)} />)
            ) : (
              <p className="px-3 py-4 text-xs text-medium-black text-center">No agents match “{query}”.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-dark-black">Reassignment Details</p>
          <div>
            <label htmlFor="reassign-reason" className="block text-xs text-medium-black mb-1.5">Reason for Reassignment</label>
            <Select id="reassign-reason" value={reason} onChange={setReason} options={REASONS} />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={notify}
              onClick={() => setNotify((value) => !value)}
              className={`relative mt-0.5 w-10 h-6 rounded-full transition-colors shrink-0 ${notify ? "bg-primary" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notify ? "translate-x-4" : ""}`} />
            </button>
            <span>
              <span className="block text-sm text-dark-black">Notify new assignee</span>
              <span className="block text-xs text-medium-black">Send an in-app and email notification.</span>
            </span>
          </label>
        </div>
      </div>
    </DialogModal>
  );
};

export default ReassignTicketModal;

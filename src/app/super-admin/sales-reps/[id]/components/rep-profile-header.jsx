import React from "react";
import {
  Mail,
  Phone,
  Briefcase,
  User,
  Eye,
  Edit,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { ProfileAvatar } from "@/components/shared/avatar-editor";
import { rosterStatus } from "../../team-api";

export default function RepProfileHeader({
  rep,
  onEditProfile,
  onImpersonate,
}) {
  const status = rosterStatus(rep);
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Back button link */}
      <div>
        <Link
          href="/super-admin/sales-reps"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-light-black hover:text-dark-black transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Sales Reps</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left: Avatar + Details */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          {/* Avatar with status border */}
          <div className="relative shrink-0">
            <ProfileAvatar name={rep.name} className="w-13 h-13 sm:w-15 sm:h-15 !border-primary" />
          </div>

          {/* Name, Role, and Meta Contact Info */}
          <div className="flex flex-col gap-1 min-w-0">
            {/* Name + Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-dark-black/90 font-secondary tracking-tight">
                {rep.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                <span>{status.label}</span>
              </span>
            </div>

            {/* Role Title */}
            <p className="text-xs font-semibold text-light-black">
              {rep.jobTitle}
            </p>

            {/* Meta Row: Email, Phone, Employee ID, Manager */}
            <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1 text-[11px] sm:text-xs text-light-black pt-0.5">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-light-black shrink-0" />
                <span className="text-dark-black/75">{rep.email}</span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-light-black shrink-0" />
                <span className="text-dark-black/75">{rep.phone || "No phone"}</span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-light-black shrink-0" />
                <span>
                  Employee ID:{" "}
                  <strong className="font-semibold text-dark-black/85">
                    {rep.employeeId ?? "—"}
                  </strong>
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-light-black shrink-0" />
                <span>
                  Manager:{" "}
                  <strong className="font-semibold text-dark-black/85">
                    {rep.managerName ?? "None"}
                  </strong>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-start lg:self-center shrink-0">
          {/* Impersonate Rep: only where offered (staff sessions can't be impersonated yet) */}
          {onImpersonate && <button
            type="button"
            onClick={onImpersonate}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-light-black" />
            <span>Impersonate Rep</span>
          </button>}

          {/* Edit Profile Button (managers only) */}
          {onEditProfile && <button
            type="button"
            onClick={onEditProfile}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>}
        </div>
      </div>
    </div>
  );
}

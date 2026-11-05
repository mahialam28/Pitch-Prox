"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Pagination from "@/components/shared/pagination/pagination";

const initialUsers = [
  {
    id: "1",
    name: "Jennifer Smith",
    company: "Acme Inc.",
    email: "jennifer@acme.com",
    phone: "+1 (310) 555-0101",
    initials: "JS",
    initialsBg: "bg-[#0EADAB] text-white",
    accountId: "ACC-001234",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 142,
    callsMax: 500,
    reportsUsed: 18,
    reportsMax: 50,
    lastActive: "Just now",
    lastActiveDot: "bg-emerald-500",
    healthScore: 92,
    healthLabel: "Healthy",
    leadType: "Top-10 local producer",
    userType: "Top-10 local producer",
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "Innovate Digital",
    email: "m.chen@innovate.io",
    phone: "+1 (415) 555-0122",
    initials: "MC",
    initialsBg: "bg-purple-600 text-white",
    accountId: "ACC-001235",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 320,
    callsMax: 1000,
    reportsUsed: 24,
    reportsMax: 100,
    lastActive: "12m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 88,
    healthLabel: "Healthy",
    leadType: "Solo agent",
    userType: "Solo agent",
  },
  {
    id: "3",
    name: "Sarah Williams",
    company: "Global Solutions",
    email: "sarah@globalsolutions.com",
    phone: "+1 (212) 555-0193",
    initials: "SW",
    initialsBg: "bg-orange-500 text-white",
    accountId: "ACC-001236",
    plan: "STARTER",
    planClass: "bg-slate-100 text-slate-600 border border-slate-200",
    status: "Trial",
    statusDot: "bg-blue-500",
    statusClass: "text-blue-600",
    calibration: "In Progress",
    calibrationClass: "bg-blue-50 text-blue-600 border border-blue-200",
    callsUsed: 48,
    callsMax: 100,
    reportsUsed: 5,
    reportsMax: 10,
    lastActive: "45m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 72,
    healthLabel: "At Risk",
    leadType: "Micro-Teams",
    userType: "Micro-Teams",
  },
  {
    id: "4",
    name: "David Martinez",
    company: "Summit Marketing",
    email: "david@summitmktg.com",
    phone: "+1 (702) 555-0184",
    initials: "DM",
    initialsBg: "bg-rose-500 text-white",
    accountId: "ACC-001237",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Past Due",
    statusDot: "bg-red",
    statusClass: "text-red font-bold",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 210,
    callsMax: 500,
    reportsUsed: 22,
    reportsMax: 50,
    lastActive: "3h ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 58,
    healthLabel: "At Risk",
    leadType: "Assistant to team",
    userType: "Assistant to team",
  },
  {
    id: "5",
    name: "Emily Davis",
    company: "Peak Performers",
    email: "emily@peakperformers.com",
    phone: "+1 (305) 555-0145",
    initials: "ED",
    initialsBg: "bg-blue-600 text-white",
    accountId: "ACC-001238",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 76,
    callsMax: 500,
    reportsUsed: 8,
    reportsMax: 50,
    lastActive: "5h ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 81,
    healthLabel: "Healthy",
    leadType: "Junior agent",
    userType: "Junior agent",
  },
  {
    id: "6",
    name: "Robert Johnson",
    company: "Next Gen Realty",
    email: "robert@nextgenrealty.com",
    phone: "+1 (617) 555-0156",
    initials: "RJ",
    initialsBg: "bg-slate-700 text-white",
    accountId: "ACC-001239",
    plan: "STARTER",
    planClass: "bg-slate-100 text-slate-600 border border-slate-200",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Not Started",
    calibrationClass: "bg-slate-100 text-slate-500 border border-slate-200",
    callsUsed: 5,
    callsMax: 100,
    reportsUsed: 0,
    reportsMax: 10,
    lastActive: "1d ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 46,
    healthLabel: "At Risk",
    leadType: "Small Teams",
    userType: "Small Teams",
  },
  {
    id: "7",
    name: "Amanda Wilson",
    company: "Core Properties",
    email: "amanda@coreprop.com",
    phone: "+1 (206) 555-0167",
    initials: "AW",
    initialsBg: "bg-purple-700 text-white",
    accountId: "ACC-001240",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Suspended",
    statusDot: "bg-red",
    statusClass: "text-red font-bold",
    calibration: "In Progress",
    calibrationClass: "bg-blue-50 text-blue-600 border border-blue-200",
    callsUsed: 0,
    callsMax: 500,
    reportsUsed: 0,
    reportsMax: 50,
    lastActive: "2d ago",
    lastActiveDot: "bg-red",
    healthScore: 22,
    healthLabel: "Inactive",
    leadType: "Mid-Size Teams",
    userType: "Mid-Size Teams",
  },
  {
    id: "8",
    name: "Brandon Lee",
    company: "Vanguard Tech",
    email: "brandon@vanguardtech.io",
    phone: "+1 (512) 555-0178",
    initials: "BL",
    initialsBg: "bg-teal-600 text-white",
    accountId: "ACC-001241",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 410,
    callsMax: 500,
    reportsUsed: 42,
    reportsMax: 50,
    lastActive: "30m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 95,
    healthLabel: "Healthy",
    leadType: "Multi-agent brokerage with a General Manager",
    userType: "Multi-agent brokerage with a General Manager",
  },
  {
    id: "9",
    name: "Rachel Green",
    company: "Central Perk Realty",
    email: "rachel@cprealty.com",
    phone: "+1 (212) 555-0189",
    initials: "RG",
    initialsBg: "bg-emerald-600 text-white",
    accountId: "ACC-001242",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 195,
    callsMax: 500,
    reportsUsed: 15,
    reportsMax: 50,
    lastActive: "1h ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 89,
    healthLabel: "Healthy",
    leadType: "Large Teams / Brokerages",
    userType: "Large Teams / Brokerages",
  },
  {
    id: "10",
    name: "Carlos Santana",
    company: "Solaris Capital",
    email: "carlos@solariscap.com",
    phone: "+1 (305) 555-0199",
    initials: "CS",
    initialsBg: "bg-amber-600 text-white",
    accountId: "ACC-001243",
    plan: "STARTER",
    planClass: "bg-slate-100 text-slate-600 border border-slate-200",
    status: "Trial",
    statusDot: "bg-blue-500",
    statusClass: "text-blue-600",
    calibration: "In Progress",
    calibrationClass: "bg-blue-50 text-blue-600 border border-blue-200",
    callsUsed: 62,
    callsMax: 100,
    reportsUsed: 4,
    reportsMax: 10,
    lastActive: "6h ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 78,
    healthLabel: "Healthy",
    leadType: "Mega-Teams",
    userType: "Mega-Teams",
  },
  {
    id: "11",
    name: "Thomas Wright",
    company: "Horizon Ventures",
    email: "thomas@horizon.io",
    phone: "+1 (415) 555-0210",
    initials: "TW",
    initialsBg: "bg-indigo-600 text-white",
    accountId: "ACC-001244",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 280,
    callsMax: 500,
    reportsUsed: 31,
    reportsMax: 50,
    lastActive: "4h ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 91,
    healthLabel: "Healthy",
    leadType: "Broker of Record, Managing Broker",
    userType: "Broker of Record, Managing Broker",
  },
  {
    id: "12",
    name: "Laura Palmer",
    company: "Twin Peaks Estates",
    email: "laura@twinpeaks.com",
    phone: "+1 (206) 555-0221",
    initials: "LP",
    initialsBg: "bg-rose-600 text-white",
    accountId: "ACC-001245",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Past Due",
    statusDot: "bg-red",
    statusClass: "text-red font-bold",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 310,
    callsMax: 500,
    reportsUsed: 19,
    reportsMax: 50,
    lastActive: "1d ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 54,
    healthLabel: "At Risk",
    leadType: "Office Manager",
    userType: "Office Manager",
  },
  {
    id: "13",
    name: "Alex Morgan",
    company: "Apex Realty Group",
    email: "alex@apexrealty.com",
    phone: "+1 (415) 555-0232",
    initials: "AM",
    initialsBg: "bg-emerald-600 text-white",
    accountId: "ACC-001246",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 420,
    callsMax: 500,
    reportsUsed: 45,
    reportsMax: 50,
    lastActive: "10m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 94,
    healthLabel: "Healthy",
    leadType: "e-Agent",
    userType: "e-Agent",
  },
  {
    id: "14",
    name: "Sophia Turner",
    company: "Nova Digital Agency",
    email: "sophia@novadigital.io",
    phone: "+1 (212) 555-0243",
    initials: "ST",
    initialsBg: "bg-purple-600 text-white",
    accountId: "ACC-001247",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 215,
    callsMax: 500,
    reportsUsed: 18,
    reportsMax: 50,
    lastActive: "2h ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 87,
    healthLabel: "Healthy",
    leadType: "Franchise Owners/Broker Owners",
    userType: "Franchise Owners/Broker Owners",
  },
  {
    id: "15",
    name: "Marcus Vance",
    company: "Vance & Associates",
    email: "marcus@vanceproperties.com",
    phone: "+1 (312) 555-0254",
    initials: "MV",
    initialsBg: "bg-blue-600 text-white",
    accountId: "ACC-001248",
    plan: "STARTER",
    planClass: "bg-slate-100 text-slate-600 border border-slate-200",
    status: "Trial",
    statusDot: "bg-blue-500",
    statusClass: "text-blue-600",
    calibration: "In Progress",
    calibrationClass: "bg-blue-50 text-blue-600 border border-blue-200",
    callsUsed: 35,
    callsMax: 100,
    reportsUsed: 3,
    reportsMax: 10,
    lastActive: "1d ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 68,
    healthLabel: "At Risk",
    leadType: "New Agents",
    userType: "New Agents",
  },
  {
    id: "16",
    name: "Jessica Alba",
    company: "Sunset Coast Living",
    email: "jessica@sunsetcoast.com",
    phone: "+1 (818) 555-0265",
    initials: "JA",
    initialsBg: "bg-teal-600 text-white",
    accountId: "ACC-001249",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 490,
    callsMax: 500,
    reportsUsed: 48,
    reportsMax: 50,
    lastActive: "Just now",
    lastActiveDot: "bg-emerald-500",
    healthScore: 98,
    healthLabel: "Healthy",
    leadType: "Luxury Agents",
    userType: "Luxury Agents",
  },
  {
    id: "17",
    name: "Ethan Hunt",
    company: "Mission Global Tech",
    email: "ethan@missionglobal.com",
    phone: "+1 (702) 555-0276",
    initials: "EH",
    initialsBg: "bg-amber-600 text-white",
    accountId: "ACC-001250",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Past Due",
    statusDot: "bg-red",
    statusClass: "text-red font-bold",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 190,
    callsMax: 500,
    reportsUsed: 14,
    reportsMax: 50,
    lastActive: "3d ago",
    lastActiveDot: "bg-red",
    healthScore: 45,
    healthLabel: "At Risk",
    leadType: "Solo agent",
    userType: "Solo agent",
  },
  {
    id: "18",
    name: "Chloe Decker",
    company: "Precision Advisory",
    email: "chloe@precisionadv.com",
    phone: "+1 (213) 555-0287",
    initials: "CD",
    initialsBg: "bg-indigo-600 text-white",
    accountId: "ACC-001251",
    plan: "STARTER",
    planClass: "bg-slate-100 text-slate-600 border border-slate-200",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Not Started",
    calibrationClass: "bg-slate-100 text-slate-500 border border-slate-200",
    callsUsed: 12,
    callsMax: 100,
    reportsUsed: 1,
    reportsMax: 10,
    lastActive: "5h ago",
    lastActiveDot: "bg-amber-500",
    healthScore: 50,
    healthLabel: "At Risk",
    leadType: "Micro-Teams",
    userType: "Micro-Teams",
  },
  {
    id: "19",
    name: "Oliver Queen",
    company: "Starling Enterprises",
    email: "oliver@starling.com",
    phone: "+1 (206) 555-0298",
    initials: "OQ",
    initialsBg: "bg-emerald-700 text-white",
    accountId: "ACC-001252",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 380,
    callsMax: 500,
    reportsUsed: 39,
    reportsMax: 50,
    lastActive: "15m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 92,
    healthLabel: "Healthy",
    leadType: "Small Teams",
    userType: "Small Teams",
  },
  {
    id: "20",
    name: "Diana Prince",
    company: "Themyscira Realty",
    email: "diana@themyscira.com",
    phone: "+1 (202) 555-0309",
    initials: "DP",
    initialsBg: "bg-rose-500 text-white",
    accountId: "ACC-001253",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 260,
    callsMax: 500,
    reportsUsed: 22,
    reportsMax: 50,
    lastActive: "45m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 89,
    healthLabel: "Healthy",
    leadType: "Mid-Size Teams",
    userType: "Mid-Size Teams",
  },
  {
    id: "21",
    name: "Bruce Wayne",
    company: "Wayne Enterprises",
    email: "bruce@waynecorp.com",
    phone: "+1 (609) 555-0310",
    initials: "BW",
    initialsBg: "bg-slate-900 text-white",
    accountId: "ACC-001254",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 450,
    callsMax: 500,
    reportsUsed: 46,
    reportsMax: 50,
    lastActive: "30m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 97,
    healthLabel: "Healthy",
    leadType: "Large Teams / Brokerages",
    userType: "Large Teams / Brokerages",
  },
  {
    id: "22",
    name: "Barry Allen",
    company: "Central City Realty",
    email: "barry@centralcity.io",
    phone: "+1 (816) 555-0321",
    initials: "BA",
    initialsBg: "bg-red text-white",
    accountId: "ACC-001255",
    plan: "PRO",
    planClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 310,
    callsMax: 500,
    reportsUsed: 25,
    reportsMax: 50,
    lastActive: "1h ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 85,
    healthLabel: "Healthy",
    leadType: "Mega-Teams",
    userType: "Mega-Teams",
  },
  {
    id: "23",
    name: "Natasha Romanoff",
    company: "Red Room Analytics",
    email: "natasha@redroom.io",
    phone: "+1 (212) 555-0332",
    initials: "NR",
    initialsBg: "bg-slate-800 text-white",
    accountId: "ACC-001256",
    plan: "STARTER",
    planClass: "bg-slate-100 text-slate-600 border border-slate-200",
    status: "Suspended",
    statusDot: "bg-red",
    statusClass: "text-red font-bold",
    calibration: "In Progress",
    calibrationClass: "bg-blue-50 text-blue-600 border border-blue-200",
    callsUsed: 0,
    callsMax: 100,
    reportsUsed: 0,
    reportsMax: 10,
    lastActive: "4d ago",
    lastActiveDot: "bg-red",
    healthScore: 18,
    healthLabel: "Inactive",
    leadType: "Broker of Record, Managing Broker",
    userType: "Broker of Record, Managing Broker",
  },
  {
    id: "24",
    name: "Steve Rogers",
    company: "Shield Holdings",
    email: "steve@shieldholdings.com",
    phone: "+1 (718) 555-0343",
    initials: "SR",
    initialsBg: "bg-blue-700 text-white",
    accountId: "ACC-001257",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 395,
    callsMax: 500,
    reportsUsed: 37,
    reportsMax: 50,
    lastActive: "2h ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 90,
    healthLabel: "Healthy",
    leadType: "Franchise Owners/Broker Owners",
    userType: "Franchise Owners/Broker Owners",
  },
  {
    id: "25",
    name: "Tony Stark",
    company: "Stark Industries",
    email: "tony@starkindustries.com",
    phone: "+1 (212) 555-0354",
    initials: "TS",
    initialsBg: "bg-amber-500 text-white",
    accountId: "ACC-001258",
    plan: "PREMIUM",
    planClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusClass: "text-dark-black/80",
    calibration: "Completed",
    calibrationClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    callsUsed: 495,
    callsMax: 500,
    reportsUsed: 49,
    reportsMax: 50,
    lastActive: "5m ago",
    lastActiveDot: "bg-emerald-500",
    healthScore: 99,
    healthLabel: "Healthy",
    leadType: "Luxury Agents",
    userType: "Luxury Agents",
  },
];

const planOptions = [
  { value: "All Plans", label: "All Plans" },
  { value: "PREMIUM", label: "Premium" },
  { value: "PRO", label: "Pro" },
  { value: "STARTER", label: "Starter" },
];

const statusFilterOptions = [
  { value: "All Statuses", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Trial", label: "Trial" },
  { value: "Past Due", label: "Past Due" },
  { value: "Suspended", label: "Suspended" },
];

const leadTypeOptions = [
  { value: "All Lead Types", label: "All Lead Types" },
  { value: "Solo agent", label: "Solo agent" },
  { value: "Micro-Teams", label: "Micro-Teams" },
  { value: "Assistant to team", label: "Assistant to team" },
  { value: "Junior agent", label: "Junior agent" },
  { value: "Small Teams", label: "Small Teams" },
  { value: "Mid-Size Teams", label: "Mid-Size Teams" },
  { value: "Multi-agent brokerage with a General Manager", label: "Multi-agent brokerage with a General Manager" },
  { value: "Large Teams / Brokerages", label: "Large Teams / Brokerages" },
  { value: "Top-10 local producer", label: "Top-10 local producer" },
  { value: "Mega-Teams", label: "Mega-Teams" },
  { value: "Broker of Record, Managing Broker", label: "Broker of Record, Managing Broker" },
  { value: "Office Manager", label: "Office Manager" },
  { value: "e-Agent", label: "e-Agent" },
  { value: "Franchise Owners/Broker Owners", label: "Franchise Owners/Broker Owners" },
  { value: "New Agents", label: "New Agents" },
  { value: "Luxury Agents", label: "Luxury Agents" },
];

const lastActiveOptions = [
  { value: "All Time", label: "All Time" },
  { value: "Today", label: "Today" },
  { value: "This Week", label: "This Week" },
  { value: "This Month", label: "This Month" },
];

const calibrationOptions = [
  { value: "All", label: "All" },
  { value: "Completed", label: "Completed" },
  { value: "In Progress", label: "In Progress" },
  { value: "Not Started", label: "Not Started" },
];

const pageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

const UserList = () => {
  const [usersList, setUsersList] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedLeadType, setSelectedLeadType] = useState("All Lead Types");
  const [selectedActive, setSelectedActive] = useState("All Time");
  const [selectedCalibration, setSelectedCalibration] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedPlan("All Plans");
    setSelectedStatus("All Statuses");
    setSelectedLeadType("All Lead Types");
    setSelectedActive("All Time");
    setSelectedCalibration("All");
    setCurrentPage(1);
  };

  // Filtered and Sorted Users
  const filteredUsers = usersList
    .filter((user) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.company.toLowerCase().includes(query) ||
        user.accountId.toLowerCase().includes(query);

      const matchesPlan =
        selectedPlan === "All Plans" || user.plan === selectedPlan;

      const matchesStatus =
        selectedStatus === "All Statuses" || user.status === selectedStatus;

      const matchesLeadType =
        selectedLeadType === "All Lead Types" ||
        selectedLeadType === "All Types" ||
        user.leadType === selectedLeadType ||
        user.userType === selectedLeadType;

      const matchesCalibration =
        selectedCalibration === "All" || user.calibration === selectedCalibration;

      return (
        matchesSearch &&
        matchesPlan &&
        matchesStatus &&
        matchesLeadType &&
        matchesCalibration
      );
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Total pages & paginated items
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const startUserIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startUserIndex, startUserIndex + pageSize);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden w-full space-y-4">
      {/* ── 1. Top Filters Bar ── */}
      <div className="p-5 sm:p-6 pb-4 border-b border-light-gray/70">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 flex-wrap">
          {/* Search Field */}
          <div className="flex-1 min-w-[260px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-light-black mb-1.5 font-primary">
              SEARCH
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, phone, company, or account ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Subscription Plan Filter */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-light-black mb-1.5 font-primary">
              SUBSCRIPTION PLAN
            </label>
            <Dropdown
              items={planOptions}
              selected={selectedPlan}
              onSelect={(val) => {
                setSelectedPlan(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-light-black mb-1.5 font-primary">
              STATUS
            </label>
            <Dropdown
              items={statusFilterOptions}
              selected={selectedStatus}
              onSelect={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
            />
          </div>

          {/* Lead Type Filter */}
          <div className="w-full sm:w-auto min-w-[150px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-light-black mb-1.5 font-primary">
              LEAD TYPE
            </label>
            <Dropdown
              items={leadTypeOptions}
              selected={selectedLeadType}
              onSelect={(val) => {
                setSelectedLeadType(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
            />
          </div>

          {/* Last Active Filter */}
          <div className="w-full sm:w-auto min-w-[110px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-light-black mb-1.5 font-primary">
              LAST ACTIVE
            </label>
            <Dropdown
              items={lastActiveOptions}
              selected={selectedActive}
              onSelect={(val) => {
                setSelectedActive(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
            />
          </div>

          {/* Calibration Status Filter */}
          <div className="w-full sm:w-auto min-w-[110px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-light-black mb-1.5 font-primary">
              CALIBRATION STATUS
            </label>
            <Dropdown
              items={calibrationOptions}
              selected={selectedCalibration}
              onSelect={(val) => {
                setSelectedCalibration(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
            />
          </div>

          {/* Action Buttons: Clear & Search */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-medium-black transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Users Table (No Checkboxes) ── */}
      {paginatedUsers.length > 0 ? (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1240px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider bg-light-gray/20">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-6 text-left cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[220px]"
                >
                  <span className="inline-flex items-center gap-1">
                    USER <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("accountId")}
                  className="py-3.5 px-4 text-left cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[130px]"
                >
                  <span className="inline-flex items-center gap-1">
                    ACCOUNT ID <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("plan")}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[130px]"
                >
                  <span className="inline-flex items-center gap-1">
                    SUBSCRIPTION <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3.5 px-4 text-left cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[110px]"
                >
                  <span className="inline-flex items-center gap-1">
                    STATUS <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("calibration")}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[130px]"
                >
                  <span className="inline-flex items-center gap-1">
                    CALIBRATION <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("callsUsed")}
                  className="py-3.5 px-4 text-left cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[150px]"
                >
                  <span className="inline-flex items-center gap-1">
                    CALLS USED <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("reportsUsed")}
                  className="py-3.5 px-4 text-left cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[140px]"
                >
                  <span className="inline-flex items-center gap-1">
                    REPORTS USED <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("lastActive")}
                  className="py-3.5 px-4 text-left cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[120px]"
                >
                  <span className="inline-flex items-center gap-1">
                    LAST ACTIVE <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("healthScore")}
                  className="py-3.5 px-6 text-left cursor-pointer hover:text-dark-black select-none whitespace-nowrap min-w-[130px]"
                >
                  <span className="inline-flex items-center gap-1">
                    HEALTH SCORE <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-light-gray/30 transition-colors"
                >
                  {/* User (Initials + Name & Company) */}
                  <td className="py-4 px-6 text-left whitespace-nowrap min-w-[220px]">
                    <Link
                      href={`/internal-sales-representative/users/${user.id}`}
                      className="flex items-center gap-3 group/user cursor-pointer"
                    >
                      <div
                        className={`w-9 h-9 rounded-full ${user.initialsBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover/user:scale-105 transition-transform`}
                      >
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-black/85 text-xs group-hover/user:text-primary transition-colors whitespace-nowrap">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-light-black font-normal mt-0.5 whitespace-nowrap">
                          {user.company}
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Account ID */}
                  <td className="py-4 px-4 text-left font-medium text-medium-black whitespace-nowrap min-w-[130px]">
                    {user.accountId}
                  </td>

                  {/* Subscription */}
                  <td className="py-4 px-4 text-center whitespace-nowrap min-w-[130px]">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${user.planClass}`}
                    >
                      {user.plan}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-left whitespace-nowrap min-w-[110px]">
                    <span
                      className={`inline-flex items-center gap-1.5 font-medium ${user.statusClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${user.statusDot}`} />
                      <span>{user.status}</span>
                    </span>
                  </td>

                  {/* Calibration */}
                  <td className="py-4 px-4 text-center whitespace-nowrap min-w-[130px]">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full ${user.calibrationClass}`}
                    >
                      {user.calibration}
                    </span>
                  </td>

                  {/* Calls Used (with progress bar) */}
                  <td className="py-4 px-4 text-left min-w-[150px] whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-xs flex items-baseline gap-1">
                        <span className="font-bold text-dark-black/85 font-secondary">
                          {user.callsUsed}
                        </span>
                        <span className="text-[11px] text-light-black">
                          {" "}
                          / {user.callsMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full max-w-[110px] h-1.5 bg-light-gray rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              (user.callsUsed / user.callsMax) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Reports Used (with progress bar) */}
                  <td className="py-4 px-4 text-left min-w-[140px] whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-xs flex items-baseline gap-1">
                        <span className="font-bold text-dark-black/85 font-secondary">
                          {user.reportsUsed}
                        </span>
                        <span className="text-[11px] text-light-black">
                          {" "}
                          / {user.reportsMax}
                        </span>
                      </div>
                      <div className="w-full max-w-[110px] h-1.5 bg-light-gray rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0EADAB] rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              (user.reportsUsed / user.reportsMax) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="py-4 px-4 text-left whitespace-nowrap min-w-[120px]">
                    <span className="inline-flex items-center gap-1.5 text-medium-black font-normal">
                      <span
                        className={`w-2 h-2 rounded-full ${user.lastActiveDot}`}
                      />
                      <span>{user.lastActive}</span>
                    </span>
                  </td>

                  {/* Health Score */}
                  <td className="py-4 px-6 text-left whitespace-nowrap min-w-[130px]">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`text-sm font-bold font-secondary ${
                          user.healthScore >= 80
                            ? "text-primary"
                            : user.healthScore >= 50
                            ? "text-amber-500"
                            : "text-red"
                        }`}
                      >
                        {user.healthScore}
                      </span>
                      <span className="text-[11px] text-light-black">
                        {user.healthLabel}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl bg-light-gray/30 border border-dashed border-light-gray m-6">
          <div className="w-12 h-12 rounded-2xl bg-light-gray flex items-center justify-center text-light-black mb-3">
            <UserX className="w-6 h-6 text-light-black" />
          </div>
          <h4 className="text-sm font-bold text-dark-black/80">
            No users found
          </h4>
          <p className="text-xs text-light-black mt-1 max-w-xs leading-relaxed">
            No user accounts match your search and filter criteria. Try
            adjusting your filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-3.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── 3. Bottom Pagination Bar ── */}
      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="users"
        />
      )}
    </div>
  );
};

export default UserList;

import {
  Calendar, Clock, Eye, FileText, Gem, Hand, Heart, HeartHandshake, HelpCircle, MessageSquare,
  Mic, PhoneCall, RotateCw, Search, ShieldAlert, Target, TrendingUp, UserX, XCircle,
} from "lucide-react";

// ── Icon components ↔ names ──
// Phases, objections and framework steps hold lucide icon components, which
// can't be stored. Saving swaps each icon for its name; loading swaps it back.
const ICONS = {
  Calendar, Clock, Eye, FileText, Gem, Hand, Heart, HeartHandshake, HelpCircle, MessageSquare,
  Mic, PhoneCall, RotateCw, Search, ShieldAlert, Target, TrendingUp, UserX, XCircle,
};

const nameOf = (icon) => Object.keys(ICONS).find((name) => ICONS[name] === icon) ?? null;

export const toStorable = (items = []) => items.map(({ icon, ...rest }) => ({ ...rest, icon: nameOf(icon) }));
export const fromStorable = (items = []) => items.map((item) => ({ ...item, icon: ICONS[item.icon] ?? MessageSquare }));

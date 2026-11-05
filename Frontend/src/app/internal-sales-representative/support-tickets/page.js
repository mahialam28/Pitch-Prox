import SupportTicketsScreen from "./support-tickets-screen";

// Live customer support queue for sales reps. "+ New Ticket" opens a ticket for one of
// the rep's customers (Mail → Support Tickets).
export default function SupportTicketsPage() {
  return <SupportTicketsScreen headerProps={{ addTicketHref: "/internal-sales-representative/mail?tab=support-tickets" }} />;
}

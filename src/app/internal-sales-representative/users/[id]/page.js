// The customer detail page is shared with Super Admin; a sales rep sees only the accounts they own
// (enforced by the API) and the actions their role allows.
export { default } from "@/app/super-admin/users/[id]/page";

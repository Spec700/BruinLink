import type { Metadata } from "next";
import { getAdminSessionState } from "@/app/admin/actions";
import { AdminReviewPanel } from "@/components/AdminReviewPanel";

export const metadata: Metadata = {
  title: "Admin Review | BruinLink",
  description: "Review BruinLink club registration requests.",
};

export default async function AdminPage() {
  const initialState = await getAdminSessionState();

  return <AdminReviewPanel initialState={initialState} />;
}

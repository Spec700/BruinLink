import type { Metadata } from "next";
import { AdminReviewPanel } from "@/components/AdminReviewPanel";

export const metadata: Metadata = {
  title: "Admin Review | BruinLink",
  description: "Review BruinLink club registration requests.",
};

export default function AdminPage() {
  return <AdminReviewPanel />;
}

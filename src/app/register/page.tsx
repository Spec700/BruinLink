import type { Metadata } from "next";
import { ClubRegistrationForm } from "@/components/ClubRegistrationForm";

export const metadata: Metadata = {
  title: "Register a Club | BruinLink",
  description: "Submit a UCLA club listing request for BruinLink admin review.",
};

export default function RegisterClubPage() {
  return <ClubRegistrationForm />;
}

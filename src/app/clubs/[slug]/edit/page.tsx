import { redirect } from "next/navigation";
import { ClubEditDashboard } from "@/components/ClubEditDashboard";
import { hasClubEditSession } from "@/lib/clubEditAuth";
import { fetchVisibleClubBySlug, fetchVisibleClubs } from "@/lib/clubs";

export const dynamic = "force-dynamic";

type ClubEditPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ClubEditPage({ params }: ClubEditPageProps) {
  const { slug } = await params;

  if (!(await hasClubEditSession(slug))) {
    redirect(`/clubs/${slug}`);
  }

  const [club, allClubs] = await Promise.all([
    fetchVisibleClubBySlug(slug),
    fetchVisibleClubs(),
  ]);

  if (!club) {
    redirect(`/clubs/${slug}`);
  }

  return <ClubEditDashboard initialClub={club} allClubs={allClubs} />;
}

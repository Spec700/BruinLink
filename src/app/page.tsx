import { fetchAllClubs } from "@/lib/clubs";
import { ClubDirectory } from "@/components/ClubDirectory";

export const dynamic = "force-dynamic";

export default async function Home() {
  const clubs = await fetchAllClubs();
  return <ClubDirectory clubs={clubs} />;
}

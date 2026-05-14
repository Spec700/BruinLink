import { ClubDirectory } from "@/components/ClubDirectory";
import { fetchVisibleClubs } from "@/lib/clubs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const clubs = await fetchVisibleClubs();

  return <ClubDirectory clubs={clubs} />;
}

import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import MatchCard from "@/components/MatchCard";

async function getMatches() {
  await dbConnect();
  return await Match.find({}).sort({ date: 1 }).lean();
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen p-4 max-w-xl mx-auto pb-32">
      <header className="pt-12 pb-12 text-center">
        <h1 className="text-5xl font-black italic text-white neon-purple-text tracking-tighter">
          GOAL<span className="text-purple-500">PRO</span>
        </h1>
        <p className="text-[10px] font-black text-purple-400/40 uppercase tracking-[0.5em] mt-3">
          Elite Wager Analytics
        </p>
      </header>

      <div className="space-y-6">
        {matches.map((match: any) => (
          <MatchCard key={match._id.toString()} match={match} />
        ))}
      </div>
    </main>
  );
}

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
    <main className="min-h-screen p-4 max-w-xl mx-auto">
      <header className="pt-12 pb-10 text-center">
        <h1 className="text-5xl font-black italic text-white glow-text tracking-tighter">
          GOAL<span className="text-purple-500">PRO</span>
        </h1>
        <p className="text-[10px] font-black text-purple-400/50 uppercase tracking-[0.4em] mt-2">
          Precision Analytics v2.0
        </p>
      </header>

      <div className="pb-24">
        {matches.map((match: any) => (
          <MatchCard key={match._id.toString()} match={match} />
        ))}
      </div>
    </main>
  );
}

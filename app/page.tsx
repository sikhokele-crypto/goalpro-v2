import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import MatchCard from "@/components/MatchCard";

async function getMatches() {
  await dbConnect();
  // Sort by date so upcoming matches are first
  return await Match.find({}).sort({ date: 1 }).lean();
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-black pb-20">
      {/* Centered Header Section */}
      <div className="max-w-[360px] mx-auto pt-10 pb-6 px-4 text-center">
        <h1 className="text-4xl font-black italic tracking-tighter text-white neon-text">
          GOAL<span className="text-blue-600">PRO</span>
        </h1>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1">
          Precision AI Analytics
        </p>
      </div>

      {/* Slim Container for the cards */}
      <div className="max-w-[360px] mx-auto px-4">
        {matches.length > 0 ? (
          matches.map((match: any) => (
            <MatchCard key={match._id.toString()} match={match} />
          ))
        ) : (
          <p className="text-zinc-500 text-center text-xs mt-20">Scanning markets for value...</p>
        )}
      </div>
    </main>
  );
}

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
    <main className="container mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-black italic tracking-tighter text-white purple-text-glow">
          GOAL<span className="text-purple-500">PRO</span>
        </h1>
        <p className="text-xs font-black text-purple-400 uppercase tracking-[0.6em] mt-3 opacity-60">
          Professional Wagering Intelligence
        </p>
      </div>

      {/* Full Width Grid */}
      <div className="space-y-8">
        {matches.length > 0 ? (
          matches.map((match: any) => (
            <MatchCard key={match._id.toString()} match={match} />
          ))
        ) : (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-300/50 font-bold uppercase text-xs tracking-widest">Scraping Worldwide Leagues...</p>
          </div>
        )}
      </div>
    </main>
  );
}

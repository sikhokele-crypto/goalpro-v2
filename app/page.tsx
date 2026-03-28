import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import MatchCard from "@/components/MatchCard"; // Standard import for default export

async function getMatches() {
  await dbConnect();
  // Fetching the 60 matches you just scraped
  return await Match.find({}).sort({ date: 1 }).lean();
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-4 pb-20">
      {/* Header Ticker */}
      <div className="flex items-center justify-between mb-8 pt-4 px-2">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            GOAL<span className="text-blue-500">PRO</span>
            <span className="text-[10px] align-top ml-1 text-zinc-500 uppercase">v2</span>
          </h1>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Premium Intelligence</p>
        </div>
        <div className="text-right">
          <div className="bg-zinc-900 border border-white/5 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-zinc-400">{matches.length} LIVE FEED</span>
          </div>
        </div>
      </div>

      {/* Match Grid */}
      <div className="max-w-2xl mx-auto space-y-4">
        {matches.map((match: any) => (
          <MatchCard key={match._id.toString()} match={match} />
        ))}
      </div>

      {/* Bottom Navigation Proxy */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
    </main>
  );
}

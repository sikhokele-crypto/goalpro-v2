import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import MatchCard from "@/components/MatchCard";

// This function pulls the data from your MongoDB
async function getMatches() {
  try {
    await dbConnect();
    // We increase the limit to 150 to ensure you show a large volume of games
    const matches = await Match.find({}).sort({ date: 1 }).limit(150);
    return JSON.parse(JSON.stringify(matches));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="p-4 md:p-10 bg-zinc-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        
        {/* Modern Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black italic text-blue-600 tracking-tighter uppercase mb-1">
            GoalPro V2
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-zinc-300"></span>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              AI Prediction Engine
            </p>
            <span className="h-[1px] w-8 bg-zinc-300"></span>
          </div>
        </header>

        {/* The Match Feed */}
        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match: any) => (
              <MatchCard key={match._id} match={match} />
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-[40px]">
              <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">
                No matches found. Run /api/scrape to sync.
              </p>
            </div>
          )}
        </div>

        {/* Simple Footer with Plans */}
        <footer className="mt-16 pb-10 text-center border-t border-zinc-200 pt-8">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-6">
            VIP Membership Access
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="bg-white px-5 py-2 rounded-2xl border border-zinc-200 shadow-sm text-[10px] font-black">
              DAILY: <span className="text-blue-600">$1</span>
            </div>
            <div className="bg-white px-5 py-2 rounded-2xl border border-blue-200 shadow-sm text-[10px] font-black text-blue-600">
              WEEKLY: $5
            </div>
            <div className="bg-white px-5 py-2 rounded-2xl border border-zinc-200 shadow-sm text-[10px] font-black">
              MONTHLY: <span className="text-blue-600">$10</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

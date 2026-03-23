// =======================
// app/page.tsx (Homepage)
// =======================
import { dbConnect } from "@/lib/dbConnect";
import Match from "@/lib/models/Match";
import { Redis } from "@upstash/redis";

// Initialize Redis for high-performance caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function GoalProHome() {
  // 1. Establish database connection
  await dbConnect();

  // 2. Define a unique cache key for today's matches
  const cacheKey = `matches:${new Date().toDateString()}`;

  // 3. Try to fetch matches from Redis first to save database costs
  let matches: any = await redis.get(cacheKey);

  if (!matches) {
    // 4. If not in cache, fetch REAL games from MongoDB
    // We sort by startTime to show the soonest games first
    matches = await Match.find({})
      .sort({ startTime: 1 })
      .limit(100)
      .lean();

    // 5. Store in Redis for 30 minutes (1800 seconds)
    await redis.set(cacheKey, matches, { ex: 1800 });
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* HEADER */}
      <nav className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <h1 className="text-2xl font-black text-yellow-500 italic tracking-tighter">
          GOALPRO V2
        </h1>
        <div className="bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {matches.length} Games Live
        </div>
      </nav>

      {/* HERO SECTION / PROMO */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 rounded-[2rem] text-black">
          <h2 className="font-black text-xl mb-1">Unlock Elite VIP Tips 🏆</h2>
          <p className="text-sm font-medium opacity-90 mb-4">
            Get access to 95% Accuracy Tips and hidden predictions.
          </p>
          <div className="bg-black/10 p-3 rounded-2xl flex items-center justify-between border border-black/5">
            <code className="text-xs font-bold truncate mr-2">
              goalpro.vercel.app/join?ref=user_id
            </code>
            <button className="bg-black text-white text-[10px] px-4 py-2 rounded-xl font-bold active:scale-95 transition-transform">
              COPY
            </button>
          </div>
        </div>
      </div>

      {/* MATCH LIST SECTION */}
      <div className="px-6 pb-4">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">
          High Probability Picks
        </h3>
        
        <section className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[2rem]">
              <p className="text-zinc-500 font-bold">No games found.</p>
              <p className="text-[10px] text-zinc-600">Run /api/scrape to fetch real data.</p>
            </div>
          ) : (
            matches.map((m: any) => (
              <div
                key={m._id.toString()}
                className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-[2rem] hover:border-zinc-700 transition-colors"
              >
                {/* League and Probability */}
                <div className="flex justify-between items-center text-[10px] font-bold mb-4">
                  <span className="text-zinc-400 uppercase tracking-wider">{m.league}</span>
                  <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-md">
                    {m.probability} PROBABILITY
                  </span>
                </div>

                {/* REAL Team Names */}
                <div className="flex justify-between items-center my-6 gap-4">
                  <span className="flex-1 font-black text-lg text-left leading-tight">
                    {m.homeTeam}
                  </span>
                  <span className="text-zinc-700 font-black italic">VS</span>
                  <span className="flex-1 font-black text-lg text-right leading-tight">
                    {m.awayTeam}
                  </span>
                </div>

                {/* Prediction Box */}
                <div className="bg-black/40 border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase mb-0.5">Market Tip</span>
                    <span
                      className={`font-black tracking-tight ${
                        m.isElite ? "blur-md select-none" : "text-yellow-500"
                      }`}
                    >
                      {m.prediction}
                    </span>
                  </div>

                  {m.isElite && (
                    <button className="bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-black px-4 py-2 rounded-xl transition-colors shadow-lg shadow-yellow-500/20">
                      UNLOCK VIP
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

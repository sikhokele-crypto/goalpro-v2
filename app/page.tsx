// =======================
// app/page.tsx
// =======================
import { dbConnect } from "@/lib/dbConnect";
import Match from "@/lib/models/Match";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function GoalProHome() {
  await dbConnect();

  const cacheKey = `matches:${new Date().toDateString()}`;
  
  // Attempt to get data from Redis cache
  let matches: any = await redis.get(cacheKey);

  if (!matches) {
    console.log("Empty Cache: Fetching from MongoDB...");
    
    // Fetch real games from MongoDB
    matches = await Match.find({})
      .sort({ startTime: 1 })
      .limit(100)
      .lean();

    // DEBUG: Check this in your Vercel Logs
    console.log("Database Results:", matches);

    if (matches && matches.length > 0) {
      await redis.set(cacheKey, matches, { ex: 1800 });
    }
  } else {
    console.log("Data loaded from Redis Cache.");
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <nav className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <h1 className="text-2xl font-black text-yellow-500 italic">
          GOALPRO V2
        </h1>
        <div className="bg-zinc-900 px-4 py-1.5 rounded-full text-xs font-bold border border-zinc-700">
          {matches?.length || 0} Games Live
        </div>
      </nav>

      {/* REFERRAL BOX */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 rounded-[2rem] text-black shadow-xl shadow-yellow-500/10">
          <h2 className="font-black text-xl mb-1 text-black">Unlock Elite VIP Tips 🏆</h2>
          <p className="text-sm font-medium mb-4 opacity-90">Invite 3 friends to get 2 days of 95% Accuracy Tips.</p>
          <div className="bg-black/10 p-3 rounded-2xl flex items-center justify-between border border-black/5">
            <code className="text-[10px] font-bold truncate mr-2">goalpro-v2.vercel.app/join?ref=user_id</code>
            <button className="bg-black text-white text-[10px] px-4 py-2 rounded-xl font-bold active:scale-95 transition-transform">COPY</button>
          </div>
        </div>
      </div>

      {/* FIXTURES SECTION */}
      <div className="px-6 pb-10">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">High Probability Picks</h3>
        
        <section className="space-y-4">
          {!matches || matches.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[2rem]">
              <p className="text-zinc-500 font-bold">No real games found in database.</p>
              <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-tighter">Visit /api/scrape to sync live data</p>
            </div>
          ) : (
            matches.map((m: any) => (
              <div key={m._id.toString()} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-[2rem]">
                <div className="flex justify-between items-center text-[10px] font-bold mb-4">
                  <span className="text-zinc-500 uppercase">{m.league || 'Soccer'}</span>
                  <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded italic">{m.probability} PROBABILITY</span>
                </div>

                <div className="flex justify-between items-center my-6 gap-2">
                  <span className="flex-1 font-black text-lg text-left leading-tight">{m.homeTeam}</span>
                  <span className="text-zinc-700 font-black italic text-sm">VS</span>
                  <span className="flex-1 font-black text-lg text-right leading-tight">{m.awayTeam}</span>
                </div>

                <div className="bg-black/40 border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase mb-0.5 tracking-tighter">Prediction</span>
                    <span className={`font-black ${m.isElite ? "blur-md select-none" : "text-yellow-500"}`}>
                      {m.prediction}
                    </span>
                  </div>
                  {m.isElite && (
                    <button className="bg-yellow-500 text-black text-[10px] font-black px-4 py-2 rounded-xl shadow-lg shadow-yellow-500/20">
                      UNLOCK
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

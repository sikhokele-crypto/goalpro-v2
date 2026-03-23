import { dbConnect } from "@/lib/dbConnect";
import Match from '@/models/Match';
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function GoalProHome() {
  await dbConnect();
  
  // 1. Get Matches (Try Redis first, then MongoDB)
  let matches: any = await redis.get("today_matches");
  if (!matches) {
    matches = await Match.find({}).sort({ startTime: 1 }).limit(150);
    await redis.set("today_matches", JSON.stringify(matches), { ex: 1800 });
  } else {
    matches = typeof matches === 'string' ? JSON.parse(matches) : matches;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <nav className="p-6 border-b border-zinc-800 flex justify-between items-center">
        <h1 className="text-2xl font-black text-yellow-500 italic">GOALPRO V2</h1>
        <div className="bg-zinc-900 px-4 py-1 rounded-full text-xs border border-zinc-700">
          150+ Games Live
        </div>
      </nav>

      {/* REFERRAL ENGINE (The 100k User Strategy) */}
      <section className="p-6">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-6 rounded-3xl text-black">
          <h2 className="text-xl font-bold">Unlock Elite VIP Tips 🏆</h2>
          <p className="text-sm font-medium opacity-90">Invite 3 friends to get 2 days of 95% Accuracy Tips.</p>
          <div className="mt-4 flex gap-2">
            <input 
              readOnly 
              value="https://goalpro.vercel.app/join?ref=user_id" 
              className="bg-white/20 border border-black/10 rounded-xl px-4 py-2 text-xs flex-1"
            />
            <button className="bg-black text-white px-6 py-2 rounded-xl font-bold text-xs">COPY</button>
          </div>
        </div>
      </section>

      {/* MATCH LIST */}
      <section className="p-6 space-y-4">
        <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">High Probability Picks</h3>
        {matches.map((m: any) => (
          <div key={m._id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl">
            <div className="flex justify-between text-[10px] text-zinc-500 mb-3 uppercase">
              <span>{m.league}</span>
              <span className="text-green-500">{m.probability} Probability</span>
            </div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold">{m.homeTeam}</span>
              <span className="text-zinc-700 text-xs">vs</span>
              <span className="text-lg font-bold">{m.awayTeam}</span>
            </div>
            
            {/* VIP TIP BOX */}
            <div className="relative group">
              <div className="bg-black border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 text-[9px] uppercase block">Market Tip</span>
                  <span className={m.isElite ? "blur-md select-none font-bold" : "font-bold text-yellow-500"}>
                    {m.prediction || "Over 1.5 Goals"}
                  </span>
                </div>
                {m.isElite && (
                  <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-[10px] font-black">UNLOCK VIP</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

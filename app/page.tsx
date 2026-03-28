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
    <main className="w-full max-w-[520px] px-6 pb-32">
      
      {/* HEADER */}
      <header className="pt-12 pb-10">
        <div className="flex justify-between items-center mb-10">
          
          <h1 className="text-5xl font-black italic text-[#00d4ff] tracking-tighter drop-shadow-[0_0_20px_rgba(0,212,255,0.6)]">
            GOALPRO
          </h1>

          <button className="bg-[#21439c] text-white px-7 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-[0_0_20px_rgba(33,67,156,0.8)] hover:scale-105 transition-all">
            UPGRADE
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <input
            placeholder="Search matches..."
            className="w-full bg-transparent border-b border-white/10 py-4 text-sm text-white/60 placeholder:text-white/20 outline-none focus:border-[#00d4ff] transition-all"
          />
        </div>
      </header>

      {/* MATCHES */}
      <div className="flex flex-col">
        {matches.map((match: any) => (
          <MatchCard key={match._id.toString()} match={match} />
        ))}
      </div>

    </main>
  );
}

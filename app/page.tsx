import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import MatchCard from "@/components/MatchCard";

async function getMatches() {
  await dbConnect();
  // Fetching your 60 matches
  return await Match.find({}).sort({ date: 1 }).lean();
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="w-full max-w-[520px] px-6 pb-32">
      <header className="pt-12 pb-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic text-[#00d4ff] tracking-tighter">GOALPRO</h1>
          <button className="bg-[#21439c] text-white px-7 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/40 border border-white/10">
            UPGRADE
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12">
          <input 
            placeholder="Search matches..." 
            className="w-full bg-transparent border-b border-white/10 py-5 text-sm text-white/50 placeholder:text-white/20 outline-none focus:border-[#00d4ff] transition-all"
          />
        </div>
      </header>

      {/* This container now has proper spacing between cards */}
      <div className="flex flex-col">
        {matches.map((match: any) => (
          <MatchCard key={match._id.toString()} match={match} />
        ))}
      </div>
    </main>
  );
}

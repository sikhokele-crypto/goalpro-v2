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
    <main className="w-full max-w-[500px] p-6 pb-20">
      <header className="pt-10 pb-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic text-[#00d4ff] tracking-tighter">GOALPRO</h1>
          <button className="bg-[#21439c] text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/40">
            UPGRADE
          </button>
        </div>

        {/* Search Bar matching image */}
        <div className="relative mb-8">
          <input 
            placeholder="Search matches..." 
            className="w-full bg-transparent border-b border-white/10 py-4 text-sm text-white/50 placeholder:text-white/20 outline-none focus:border-[#00d4ff] transition-all"
          />
        </div>
      </header>

      <div className="space-y-4">
        {matches.map((match: any) => (
          <MatchCard key={match._id.toString()} match={match} />
        ))}
      </div>
    </main>
  );
}

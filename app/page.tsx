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
    <main className="w-full max-w-[500px] px-4 pb-32">
      
      {/* STICKY HEADER: Old Version Look */}
      <header className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-md pt-10 pb-6 mb-8 border-b border-slate-900">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter">
            GOALPRO
          </h1>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40">
            UPGRADE
          </button>
        </div>

        {/* SEARCH: Old Version Border Style */}
        <div className="relative">
          <input 
            placeholder="Search matches..." 
            className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </header>

      {/* MATCH LIST */}
      <div className="flex flex-col">
        {matches.map((match: any) => (
          <MatchCard key={match._id.toString()} match={match} />
        ))}
      </div>
    </main>
  );
}

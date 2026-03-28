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
    <main className="min-h-screen p-4 max-w-xl mx-auto pb-32">
      <header className="sticky top-0 bg-[#020617]/95 pt-6 pb-6 mb-10 z-50">
        <div className="flex justify-between items-center">
          <h1 className="text-5xl font-black text-purple-500 italic purple-text-shadow tracking-tighter">
            GOALPRO
          </h1>
          <div className="bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-xl">
             <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
               {matches.length} LIVE
             </span>
          </div>
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

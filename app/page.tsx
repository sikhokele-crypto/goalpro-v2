import React from "react";
import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import { Trophy, Clock, AlertCircle, Zap } from "lucide-react";

async function getMatches() {
  try {
    await dbConnect();
    // Only show matches starting from right now onwards
    const matches = await Match.find({ date: { $gte: new Date().toISOString() } })
      .sort({ date: 1 })
      .limit(200);
    return JSON.parse(JSON.stringify(matches));
  } catch (e) {
    console.error("Error fetching matches:", e);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="p-4 md:p-8 bg-zinc-50 min-h-screen text-zinc-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-blue-600 flex items-center gap-2">
          <Trophy className="text-yellow-500" /> GOALPRO V2
        </h1>

        <div className="grid gap-6">
          {matches.length > 0 ? (
            matches.map((match: any) => (
              <div key={match._id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{match.league}</span>
                  {match.isElite && (
                    <span className="text-[10px] font-black bg-yellow-400 text-black px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap size={10} fill="black" /> VIP ELITE
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center font-bold text-xl mb-6">
                  <span className="flex-1">{match.homeTeam}</span>
                  <span className="px-4 text-zinc-300 italic text-sm">VS</span>
                  <span className="flex-1 text-right">{match.awayTeam}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-zinc-100 p-3 rounded-2xl text-center">
                    <p className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Home</p>
                    <p className="font-bold">{match.odds.home.toFixed(2)}</p>
                  </div>
                  <div className="bg-zinc-100 p-3 rounded-2xl text-center">
                    <p className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Draw</p>
                    <p className="font-bold">{match.odds.draw.toFixed(2)}</p>
                  </div>
                  <div className="bg-zinc-100 p-3 rounded-2xl text-center">
                    <p className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Away</p>
                    <p className="font-bold">{match.odds.away.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                  <div className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock size={14} /> {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' })}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 uppercase font-bold">AI Prediction</p>
                    <p className="text-blue-600 font-black text-lg">{match.prediction} <span className="text-zinc-400 font-medium">({match.probability})</span></p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white border-2 border-dashed rounded-3xl">
              <AlertCircle className="mx-auto mb-2 text-zinc-300" size={48} />
              <p className="text-zinc-500 font-medium">No active matches found. Run the scraper to populate.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

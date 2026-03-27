import React from 'react';
import dbConnect from '@/lib/dbConnect';
// CHANGE THIS LINE:
import Match from "@/lib/models/match"; 
import { Trophy, Clock, AlertCircle, Zap } from 'lucide-react';

async function getMatches() {
  try {
    await dbConnect();
    const matches = await Match.find({}).sort({ startTime: 1 }).limit(15);
    return JSON.parse(JSON.stringify(matches));
  } catch (e) {
    console.error("Home Page DB Error:", e);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="p-4 md:p-8 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-yellow-500 flex items-center gap-2">
        <Trophy /> GoalPro V2
      </h1>

      <div className="grid gap-4">
        {matches.length > 0 ? (
          matches.map((match: any) => (
            <div key={match._id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{match.league}</span>
                {match.isElite && (
                  <span className="flex items-center gap-1 text-[10px] font-black bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                    <Zap size={10} fill="black" /> ELITE IQ
                  </span>
                )}
              </div>
              
              <div className="flex justify-between font-bold text-lg mb-4">
                <span className="w-2/5">{match.homeTeam}</span>
                <span className="text-zinc-700 italic">VS</span>
                <span className="w-2/5 text-right">{match.awayTeam}</span>
              </div>

              <div className="flex justify-between items-end border-t border-zinc-800 pt-4">
                <div className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock size={12} /> {new Date(match.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' })}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Prediction</p>
                  <p className="text-blue-400 font-black">{match.prediction} ({match.probability})</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-dashed border-zinc-800">
            <AlertCircle className="mx-auto mb-4 text-zinc-700" size={48} />
            <p className="text-zinc-500 font-bold">No live analysis available.</p>
            <p className="text-zinc-600 text-sm">Run /api/scrape to fetch new data.</p>
          </div>
        )}
      </div>
    </main>
  );
}

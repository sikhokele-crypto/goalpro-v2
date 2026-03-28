import React from 'react';
import dbConnect from '@/lib/dbConnect';
import Match from "@/lib/models/match";
import { Trophy, Clock, Zap } from 'lucide-react';

export default async function Home() {
  await dbConnect();
  // Fetch the 8 matches you just scraped
  const matches = await Match.find({}).sort({ startTime: 1 });
  const data = JSON.parse(JSON.stringify(matches));

  return (
    <main className="p-4 md:p-8 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-yellow-500 flex items-center gap-2">
        <Trophy /> GOALPRO V2
      </h1>

      <div className="grid gap-4">
        {data.length > 0 ? (
          data.map((m: any) => (
            <div key={m._id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{m.league}</span>
                {m.isElite && (
                  <span className="text-[10px] font-black bg-yellow-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap size={10} fill="black" /> ELITE IQ
                  </span>
                )}
              </div>
              
              <div className="flex justify-between font-bold text-lg mb-4">
                <span className="w-2/5">{m.homeTeam}</span>
                <span className="text-zinc-700 italic">VS</span>
                <span className="w-2/5 text-right">{m.awayTeam}</span>
              </div>

              <div className="flex justify-between items-end border-t border-zinc-800 pt-4">
                <div className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock size={12} /> {m.startTime ? new Date(m.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' }) : "TBD"}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Prediction</p>
                  <p className="text-blue-400 font-black">{m.prediction} ({m.probability})</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No matches found. Try refreshing /api/scrape.
          </div>
        )}
      </div>
    </main>
  );
}

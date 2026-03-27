import React from 'react';
import dbConnect from '@/lib/dbConnect';
import Match from "@/lib/models/match";
import { Trophy, Clock, Zap } from 'lucide-react';

export default async function Home() {
  await dbConnect();
  // Fetch matches and convert them to a plain object for Next.js
  const matches = await Match.find({}).sort({ startTime: 1 }).limit(20);
  const data = JSON.parse(JSON.stringify(matches));

  return (
    <main className="p-6 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-3xl font-black italic uppercase text-yellow-500 mb-8 tracking-tighter flex items-center gap-2">
        <Trophy size={28} /> GOALPRO V2
      </h1>
      
      <div className="grid gap-4">
        {data.length > 0 ? (
          data.map((m: any) => {
            // Safety check for valid dates
            const dateObj = m.startTime ? new Date(m.startTime) : null;
            const isValidDate = dateObj && !isNaN(dateObj.getTime());
            
            return (
              <div key={m._id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span className="text-zinc-500">{m.league || "Soccer"}</span>
                  {m.isElite && (
                    <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={10} fill="black" /> ELITE IQ
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center font-bold text-lg mb-4">
                  <span className="w-5/12">{m.homeTeam}</span>
                  <span className="text-zinc-700 italic text-sm">VS</span>
                  <span className="w-5/12 text-right">{m.awayTeam}</span>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-zinc-800/50">
                  <div className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock size={14} /> 
                    {isValidDate ? dateObj.toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' }) : "TBD"}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Prediction</p>
                    <p className="text-blue-400 font-black">{m.prediction} ({m.probability})</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 font-bold uppercase tracking-widest">No Analysis Available</p>
            <p className="text-zinc-700 text-xs mt-1">Run the scraper to fetch latest odds.</p>
          </div>
        )}
      </div>
    </main>
  );
}

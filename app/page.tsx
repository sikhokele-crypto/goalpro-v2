import React from "react";
import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import { Trophy, Clock, AlertCircle, Zap, RefreshCw } from "lucide-react";

async function getMatches() {
  try {
    await dbConnect();
    // Logic: Show matches from 6 hours ago up to 48 hours in the future
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    
    const matches = await Match.find({ date: { $gte: sixHoursAgo } })
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
  const lastUpdate = matches.length > 0 ? new Date(matches[0].updatedAt).toLocaleString() : null;

  return (
    <main className="p-4 md:p-8 bg-zinc-50 min-h-screen text-zinc-900 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-blue-600 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> GOALPRO V2
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Betway AI Predictions</p>
          </div>
          {lastUpdate && (
            <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-zinc-200">
              <RefreshCw size={10} /> UPDATED: {lastUpdate}
            </div>
          )}
        </header>

        <div className="grid gap-4">
          {matches.length > 0 ? (
            matches.map((match: any) => (
              <div key={match._id} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-tight">{match.league}</span>
                  {match.isElite && (
                    <span className="text-[10px] font-black bg-yellow-400 text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={10} fill="black" /> VIP ELITE
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center font-bold text-lg mb-4">
                  <span className="w-[45%]">{match.homeTeam}</span>
                  <span className="text-zinc-200 italic text-xs">VS</span>
                  <span className="w-[45%] text-right">{match.awayTeam}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-zinc-50 p-2 rounded-xl text-center border border-zinc-100">
                    <p className="text-[8px] uppercase font-bold text-zinc-400">Home</p>
                    <p className="text-sm font-bold">{match.odds?.home?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-xl text-center border border-zinc-100">
                    <p className="text-[8px] uppercase font-bold text-zinc-400">Draw</p>
                    <p className="text-sm font-bold">{match.odds?.draw?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-xl text-center border border-zinc-100">
                    <p className="text-[8px] uppercase font-bold text-zinc-400">Away</p>
                    <p className="text-sm font-bold">{match.odds?.away?.toFixed(2) || "N/A"}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-50">
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                    <Clock size={12} /> {new Date(match.date).toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' })}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-400 uppercase font-black">AI Pick</p>
                    <p className="text-blue-600 font-black text-md leading-none">{match.prediction} <span className="text-zinc-400 text-xs">({match.probability})</span></p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-3xl">
              <AlertCircle className="mx-auto mb-2 text-zinc-300" size={40} />
              <p className="text-zinc-500 font-bold uppercase tracking-tighter">No matches in database</p>
              <p className="text-zinc-400 text-xs">Visit /api/scrape to refresh the feed.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

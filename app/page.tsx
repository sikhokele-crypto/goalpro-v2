import React from "react";
import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import { Trophy, Clock, Lock, Zap, ShieldCheck } from "lucide-react";

async function getMatches() {
  try {
    await dbConnect();
    // Fetch the 100 most recent matches
    const matches = await Match.find({}).sort({ date: 1 }).limit(100);
    return JSON.parse(JSON.stringify(matches));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="p-4 md:p-8 bg-zinc-50 min-h-screen text-zinc-900 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex justify-between items-end border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-4xl font-black italic text-blue-600 flex items-center gap-2 uppercase tracking-tighter">
              <Trophy className="text-yellow-500" size={32} /> GOALPRO V2
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Next-Gen AI Betting Intelligence
            </p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              SERVER ONLINE
            </span>
          </div>
        </header>

        {/* Matches Grid */}
        <div className="grid gap-8">
          {matches.length > 0 ? (
            matches.map((match: any) => (
              <div key={match._id} className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm hover:shadow-md transition-shadow">
                
                {/* League & Time Row */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[11px] font-black uppercase text-zinc-400 tracking-tight bg-zinc-50 px-3 py-1 rounded-lg">
                    {match.league || "Global League"}
                  </span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-bold">
                    <Clock size={14} className="text-blue-500" /> 
                    {new Date(match.date).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Main Match Display */}
                <div className="flex justify-between items-center font-black text-2xl md:text-3xl mb-8 tracking-tighter">
                  <span className="w-[42%] break-words">{match.homeTeam}</span>
                  <span className="text-zinc-200 italic text-sm font-medium">VS</span>
                  <span className="w-[42%] text-right break-words">{match.awayTeam}</span>
                </div>

                {/* FREE MARKET SECTION */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-5 mb-6 text-white shadow-lg shadow-blue-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Free Analysis (1X2)</span>
                    <span className="text-[9px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">PUBLIC ACCESS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-black italic uppercase tracking-tight">
                      {match.prediction || "Calculating..."}
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold opacity-70 uppercase">AI Confidence</div>
                      <div className="text-lg font-black">{match.probability || "0%"}</div>
                    </div>
                  </div>
                </div>

                {/* VIP MARKETS SECTION (The Fix is Here) */}
                <div className="relative rounded-3xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 p-6">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={14} className="text-blue-600" /> VIP PREDICTIONS
                    </span>
                    <div className="flex gap-1.5">
                      <span className="text-[9px] font-black bg-zinc-900 text-white px-2.5 py-1 rounded-lg italic">VIP ONLY</span>
                    </div>
                  </div>

                  {/* Blurred Data Grid - Using Optional Chaining to prevent crashes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 filter blur-[6px] opacity-20 select-none pointer-events-none">
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">O/U: {match.vipMarkets?.oversUnders || "..."}</div>
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">BTTS: {match.vipMarkets?.btts || "..."}</div>
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">DC: {match.vipMarkets?.doubleChance || "..."}</div>
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">DNB: {match.vipMarkets?.drawNoBet || "..."}</div>
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">1st H: {match.vipMarkets?.firstHalfOvers || "..."}</div>
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">Corners: {match.vipMarkets?.totalCorners || "..."}</div>
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">Home O: {match.vipMarkets?.homeTeamOvers || "..."}</div>
                    <div className="bg-white border p-3 rounded-xl text-[10px] font-bold">Away O: {match.vipMarkets?.awayTeamOvers || "..."}</div>
                  </div>

                  {/* Premium Call to Action Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 text-center">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-xl max-w-[280px]">
                      <Zap size={24} className="text-blue-600 mx-auto mb-2" fill="currentColor" />
                      <h3 className="text-sm font-black uppercase tracking-tight mb-1">Unlock Pro Analysis</h3>
                      <p className="text-[10px] text-zinc-500 font-bold mb-4">Get access to all 8 premium markets for this match.</p>
                      
                      <button className="w-full bg-blue-600 text-white font-black text-[11px] py-3 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-tighter">
                        View Pricing Plans
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white border-4 border-dashed border-zinc-100 rounded-[40px]">
              <ShieldCheck className="mx-auto mb-4 text-zinc-200" size={60} />
              <h2 className="text-xl font-black text-zinc-300 uppercase italic">Awaiting Next Sync...</h2>
              <p className="text-zinc-400 text-xs mt-2 font-bold uppercase tracking-widest">Visit /api/scrape to refresh the intelligence feed.</p>
            </div>
          )}
        </div>

        {/* Pricing Footer */}
        <footer className="mt-12 text-center pb-10">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Premium Membership Plans</p>
          <div className="flex justify-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold">Daily: $1</div>
            <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold text-blue-600">Weekly: $5</div>
            <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold">Monthly: $10</div>
          </div>
        </footer>
      </div>
    </main>
  );
}

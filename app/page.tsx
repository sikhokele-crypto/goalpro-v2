import React from "react";
import dbConnect from "@/lib/dbConnect";
import Match from "@/lib/models/match";
import { Trophy, Clock, Lock, Zap, ShieldCheck } from "lucide-react";

async function getMatches() {
  await dbConnect();
  const matches = await Match.find({}).sort({ date: 1 }).limit(100);
  return JSON.parse(JSON.stringify(matches));
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="p-4 md:p-8 bg-zinc-50 min-h-screen text-zinc-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic text-blue-600 flex items-center gap-2 uppercase tracking-tighter">
              <Trophy className="text-yellow-500" /> GOALPRO V2
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global AI Betting Analysis</p>
          </div>
        </header>

        <div className="grid gap-6">
          {matches.map((match: any) => (
            <div key={match._id} className="bg-white border border-zinc-200 rounded-[32px] p-6 shadow-sm">
              {/* Header Info */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase text-zinc-400">{match.league}</span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                  <Clock size={12} /> {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Teams */}
              <div className="flex justify-between items-center font-black text-xl mb-6">
                <span className="w-[45%]">{match.homeTeam}</span>
                <span className="text-zinc-200 italic text-xs">VS</span>
                <span className="w-[45%] text-right">{match.awayTeam}</span>
              </div>

              {/* FREE MARKET: 1X2 */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">FREE PICK (1X2)</span>
                  <span className="text-[10px] font-bold text-green-600 bg-white px-2 py-0.5 rounded-full border border-green-100">FREE ACCESS</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-black text-blue-700">{match.prediction}</span>
                  <span className="text-sm font-bold text-zinc-400">{match.probability} Confidence</span>
                </div>
              </div>

              {/* VIP MARKETS PAYWALL */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50/50 p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Lock size={12} className="text-blue-600" /> VIP MARKETS
                  </span>
                  <div className="flex gap-1">
                    <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">$1/Day</span>
                    <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">$10/Mo</span>
                  </div>
                </div>

                {/* Blurred Content */}
                <div className="grid grid-cols-2 gap-3 filter blur-[5px] opacity-30 select-none pointer-events-none">
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">O/U: {match.vipMarkets.oversUnders}</div>
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">BTTS: {match.vipMarkets.btts}</div>
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">DC: {match.vipMarkets.doubleChance}</div>
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">Corners: {match.vipMarkets.totalCorners}</div>
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">Home O/U: {match.vipMarkets.homeTeamOvers}</div>
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">Away O/U: {match.vipMarkets.awayTeamOvers}</div>
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">DNB: {match.vipMarkets.drawNoBet}</div>
                  <div className="bg-white p-2 rounded-lg text-[10px] font-bold border">1H O/U: {match.vipMarkets.firstHalfOvers}</div>
                </div>

                {/* Overlay Button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/10 backdrop-blur-[2px]">
                   <button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-8 py-3 rounded-full shadow-xl shadow-blue-200 transition-all active:scale-95 uppercase">
                    Unlock VIP Markets
                  </button>
                  <p className="text-[9px] mt-2 font-bold text-zinc-400 uppercase tracking-tighter">Get Overs/Unders, BTTS, Corners & More</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

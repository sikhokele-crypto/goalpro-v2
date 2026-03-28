'use client';
import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  if (!match) return null;

  const marketKeys = [
    "BTTS", "OVERS UNDERS", 
    "DOUBLE CHANCE", "HANDICAP", 
    "CLEAN SHEET", "FIRST HALF",
    "TOTAL CORNERS", "HOME OVERS"
  ];

  // ✅ SAFE probabilities (no crash)
  const probs = [
    { label: "Home", value: Number(match?.homeProb ?? 45) },
    { label: "Draw", value: Number(match?.drawProb ?? 25) },
    { label: "Away", value: Number(match?.awayProb ?? 30) },
  ];

  // ✅ SAFE pick logic
  const topPick = probs.reduce((prev, current) => {
    return current.value > prev.value ? current : prev;
  });

  return (
    <div className="w-full max-w-[500px] bg-gradient-to-b from-[#182235] to-[#0f1624] rounded-[36px] p-8 mb-10 border border-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      
      {/* TOP ROW */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-[#4e638c] uppercase tracking-widest">
          {match.league}
        </span>

        <span className="text-[10px] font-black text-[#00d4ff]">
          {match.probability}%
        </span>
      </div>

      {/* TEAMS */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-black uppercase w-[45%] leading-tight">
          {match.homeTeam}
        </h2>

        <span className="text-xs text-[#4e638c] italic">VS</span>

        <h2 className="text-lg font-black uppercase text-right w-[45%] leading-tight">
          {match.awayTeam}
        </h2>
      </div>

      {/* ✅ AUTO PICK */}
      <div className="text-center mb-6">
        <span className="text-[10px] font-black text-[#00ffa3] tracking-widest">
          PICK: {topPick.label.toUpperCase()} WIN
        </span>
        <p className="text-[8px] text-white/40 mt-1">
          Based on AI probability
        </p>
      </div>

      {/* MAIN CONFIDENCE BAR */}
      <div className="w-full h-[10px] bg-white/5 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3]"
          style={{ width: `${match.probability || 50}%` }}
        />
      </div>

      {/* ✅ PROBABILITY BREAKDOWN */}
      <div className="space-y-4 mb-8">
        {probs.map((item) => {
          const isTop = item.label === topPick.label;

          return (
            <div key={item.label}>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span className={isTop ? "text-[#00ffa3]" : "text-white/60"}>
                  {item.label}
                </span>

                <span className={isTop ? "text-[#00ffa3]" : "text-white"}>
                  {item.value}%
                </span>
              </div>

              <div className="w-full h-[6px] bg-white/5 rounded-full overflow-hidden">
                <div
                  className={isTop ? "h-full bg-gradient-to-r from-[#00ffa3] to-[#00d4ff]" : "h-full bg-white/20"}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* BET BUTTON */}
      <a
        href="#"
        className="block text-center mb-6 bg-gradient-to-r from-[#00d4ff] to-[#0094ff] py-4 rounded-[18px] text-[11px] font-black uppercase text-[#0d121d]"
      >
        Bet on Betway
      </a>

      {/* TOGGLE MARKETS */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#1c2638] text-white text-[10px] font-bold uppercase tracking-widest py-4 rounded-[20px] mb-4 border border-white/5"
      >
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 VIP MARKETS"}
      </button>

      {/* MARKETS */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {marketKeys.map((key) => (
            <div
              key={key}
              onClick={() => setShowPayment(true)}
              className="bg-white/[0.03] border border-white/[0.06] h-20 rounded-[20px] flex flex-col justify-center px-4 cursor-pointer"
            >
              <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-1">
                {key}
              </p>

              <div className="flex items-center gap-2">
                <Lock size={10} className="text-[#00d4ff]" />
                <span className="text-[9px] text-white/20 uppercase">
                  LOCKED
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAYMENT */}
      {showPayment && (
        <div className="mt-6 bg-[#00d4ff] p-6 rounded-[20px] text-center text-black">
          <p className="font-bold mb-3">Unlock VIP</p>

          <button className="bg-black text-white px-4 py-2 rounded mb-2 w-full">
            $1 Daily
          </button>

          <button className="border border-black px-4 py-2 rounded w-full">
            $5 Weekly
          </button>

          <button
            onClick={() => setShowPayment(false)}
            className="block mt-3 text-xs"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

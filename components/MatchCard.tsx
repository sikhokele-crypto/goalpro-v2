'use client';
import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const marketKeys = [
    "BTTS", "OVERS_UNDERS", 
    "DOUBLE_CHANCE", "HANDICAP", 
    "CLEAN_SHEET", "FIRST_HALF",
    "TOTAL_CORNERS", "HOME_OVERS"
  ];

  // ✅ Probabilities with safe fallbacks to prevent "undefined" errors
  const probs = [
    { label: "Home", value: match.homeProb || 45 },
    { label: "Draw", value: match.drawProb || 25 },
    { label: "Away", value: match.awayProb || 30 },
  ];

  // ✅ Fixed the topPick logic to be safer
  const topPick = probs.reduce((prev, current) =>
    current.value > prev.value ? current : prev
  , probs[0]);

  return (
    <div className="w-full max-w-[500px] 
      bg-gradient-to-b from-[#182235] to-[#0f1624]
      rounded-[36px] p-8 mb-10 border border-white/5 
      shadow-[0_20px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl"> {/* FIXED: Added closing quote and bracket here */}
      
      {/* TOP ROW */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-[#4e638c] uppercase tracking-widest">
          {match.league}
        </span>

        <span className="text-[10px] font-black text-[#00d4ff] italic tracking-tighter">
          {match.probability || 0}% CONFIDENCE
        </span>
      </div>

      {/* TEAMS */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-black uppercase w-[45%] leading-tight text-white">
          {match.homeTeam}
        </h2>

        <span className="text-xs text-[#4e638c] italic">VS</span>

        <h2 className="text-lg font-black uppercase text-right w-[45%] leading-tight text-white">
          {match.awayTeam}
        </h2>
      </div>

      {/* ✅ AUTO PICK */}
      <div className="text-center mb-6">
        <span className="text-[9px] font-black text-[#00ffa3] tracking-[0.3em]">
          PICK: {topPick.label.toUpperCase()} {topPick.label === "Draw" ? "" : "WIN"}
        </span>
        <p className="text-[8px] text-white/40 mt-1 uppercase tracking-widest">
          AI Intelligence Model
        </p>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-[10px] bg-white/5 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] shadow-[0_0_25px_#00d4ff]"
          style={{ width: `${match.probability || 0}%` }}
        />
      </div>

      {/* ✅ PROBABILITY BREAKDOWN */}
      <div className="space-y-4 mb-8">
        {probs.map((item) => {
          const isTop = item.label === topPick.label;

          return (
            <div key={item.label}>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span className={isTop ? "text-[#00ffa3]" : "text-[#4e638c]"}>
                  {item.label}
                </span>
                <span className={isTop ? "text-[#00ffa3]" : "text-white"}>
                  {item.value}%
                </span>
              </div>

              <div className="w-full h-[6px] bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isTop
                      ? "bg-gradient-to-r from-[#00ffa3] to-[#00d4ff] shadow-[0_0_15px_#00ffa3]"
                      : "bg-white/10"
                  }`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* BETWAY BUTTON - Add your affiliate link in href */}
      <a 
        href="https://www.betway.co.za" 
        target="_blank"
        className="block text-center mb-6 bg-gradient-to-r from-[#00d4ff] to-[#0094ff] 
        py-4 rounded-[18px] text-[11px] font-black uppercase 
        text-[#0d121d] shadow-[0_10px_30px_rgba(0,212,255,0.4)]
        hover:scale-[1.02] active:scale-95 transition-all"
      >
        Bet on Betway
      </a>

      {/* TOGGLE MARKETS */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#1c2638] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-5 rounded-[22px] mb-4 border border-white/5 hover:bg-[#25324a] transition-all"
      >
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 VIP MARKETS"}
      </button>

      {/* MARKETS */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {marketKeys.map((key) => (
                <div 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="bg-white/[0.03] border border-white/[0.06] h-24 rounded-[26px] flex flex-col justify-center px-6 cursor-pointer hover:bg-white/[0.08] hover:border-white/10 transition-all"
                >
                  <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-2 tracking-widest">
                    {key.replace(/_/g, ' ')}
                  </p>

                  <div className="flex items-center gap-2">
                    <Lock size={11} className="text-[#00d4ff] opacity-40" />
                    <span className="text-[10px] font-black text-white/10 uppercase italic">
                      LOCKED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#00d4ff] to-[#0094ff] rounded-[35px] p-10 text-center text-[#0d121d] mt-6 shadow-xl">
              <h3 className="text-xl font-black uppercase italic mb-6 leading-tight">
                Unlock Elite 8 Intelligence
              </h3>

              <div className="space-y-3">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="block bg-[#0d121d] text-white py-4 rounded-[20px] text-[11px] font-black uppercase">
                  Daily Access — $1
                </a>

                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="block border-2 border-[#0d121d] py-4 rounded-[20px] text-[11px] font-black uppercase">
                  Weekly Pro — $5
                </a>
              </div>

              <button 
                onClick={() => setShowPayment(false)} 
                className="mt-6 text-[9px] font-black uppercase opacity-60"
              >
                Return
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

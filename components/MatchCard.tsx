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

  return (
    <div className="w-full max-w-[500px] 
      bg-gradient-to-b from-[#182235] to-[#111827]
      rounded-[36px] 
      p-8 mb-10 
      border border-white/5 
      shadow-[0_20px_60px_rgba(0,0,0,0.6)]
      backdrop-blur-xl
      animate-in fade-in slide-in-from-bottom-6 duration-500"
    >
      
      {/* TOP ROW */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-[#4e638c] uppercase tracking-widest">
          {match.league}
        </span>

        <span className="text-[10px] font-black text-[#00d4ff] uppercase italic tracking-tighter">
          {match.probability}% CONFIDENCE
        </span>
      </div>

      {/* TEAMS */}
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-lg font-black text-white uppercase tracking-tight w-[45%] leading-tight">
          {match.homeTeam}
        </h2>

        <span className="text-xs font-bold text-[#4e638c] italic px-2">VS</span>

        <h2 className="text-lg font-black text-white uppercase tracking-tight text-right w-[45%] leading-tight">
          {match.awayTeam}
        </h2>
      </div>

      {/* PICK */}
      <div className="text-center mb-6">
        <span className="text-[9px] font-black text-[#00ffa3] uppercase tracking-[0.3em]">
          PICK: {match.prediction}
        </span>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-[10px] bg-white/5 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] shadow-[0_0_20px_#00d4ff,0_0_40px_rgba(0,255,163,0.6)]"
          style={{ width: `${match.probability}%` }}
        />
      </div>

      {/* TOGGLE BUTTON */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#1c2638] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-5 rounded-[22px] mb-4 border border-white/5 hover:bg-[#25324a] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
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
                  className="bg-white/[0.03] border border-white/[0.06] h-24 rounded-[26px] flex flex-col justify-center px-6 cursor-pointer hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all duration-300 group"
                >
                  <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-2 tracking-widest">
                    {key.replace(/_/g, ' ')}
                  </p>

                  <div className="flex items-center gap-2">
                    <Lock size={11} className="text-[#00d4ff] opacity-30 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-black text-white/10 tracking-widest uppercase italic">
                      LOCKED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* PAYMENT UI */
            <div className="bg-gradient-to-br from-[#00d4ff] to-[#0094ff] rounded-[35px] p-10 text-center text-[#0d121d] mt-6 shadow-xl">
              <h3 className="text-xl font-black uppercase italic mb-6">
                Unlock Elite 8 Intelligence
              </h3>

              <div className="space-y-3">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank"
                  className="block bg-[#0d121d] text-white py-4 rounded-[20px] text-[11px] font-black uppercase shadow-lg">
                  Daily Access — $1
                </a>

                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank"
                  className="block border-2 border-[#0d121d] py-4 rounded-[20px] text-[11px] font-black uppercase">
                  Weekly Pro — $5
                </a>
              </div>

              <button 
                onClick={() => setShowPayment(false)} 
                className="mt-6 text-[9px] font-black uppercase opacity-60 tracking-widest"
              >
                Return to Match
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

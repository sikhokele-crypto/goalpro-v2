'use client';
import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // The 8 markets from your layout
  const marketKeys = [
    "BTTS", "OVERS_UNDERS", 
    "DOUBLE_CHANCE", "HANDICAP", 
    "CLEAN_SHEET", "FIRST_HALF",
    "TOTAL_CORNERS", "HOME_OVERS"
  ];

  return (
    /* Added mb-12 to stop cards from squashing together */
    <div className="w-full max-w-[500px] bg-[#161d2b] rounded-[40px] p-8 mb-12 border border-white/5 shadow-2xl">
      
      {/* League & Confidence Percentage */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-[#4e638c] uppercase tracking-widest">
          {match.league}
        </span>
        {/* Added the missing percentage readout */}
        <span className="text-[10px] font-black text-[#00d4ff] uppercase italic tracking-tighter">
          {match.probability}% CONFIDENCE
        </span>
      </div>

      {/* Teams Section */}
      <div className="flex justify-between items-center mb-2 px-2">
        <h2 className="text-xl font-black text-white uppercase tracking-tight w-[45%] leading-tight">
          {match.homeTeam}
        </h2>
        <span className="text-xs font-bold text-[#4e638c] italic px-2">VS</span>
        <h2 className="text-xl font-black text-white uppercase tracking-tight text-right w-[45%] leading-tight">
          {match.awayTeam}
        </h2>
      </div>

      {/* Main Pick Readout */}
      <div className="text-center mb-6">
        <span className="text-[9px] font-black text-[#00ffa3] uppercase tracking-[0.3em]">
          PICK: {match.prediction}
        </span>
      </div>

      {/* The Teal Progress Bar */}
      <div className="w-full h-[8px] bg-white/5 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] shadow-[0_0_10px_#00d4ff]" 
          style={{ width: `${match.probability}%` }}
        />
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#1c2638] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-5 rounded-[22px] mb-4 hover:bg-[#25324a] transition-all border border-white/5"
      >
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 VIP MARKETS"}
      </button>

      {/* 8 Market Grid */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {marketKeys.map((key) => (
                <div 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="bg-white/[0.02] border border-white/[0.05] h-24 rounded-[28px] flex flex-col items-start justify-center px-6 cursor-pointer hover:bg-white/[0.05] transition-all group"
                >
                  <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-2 tracking-widest">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Lock size={11} className="text-[#00d4ff] opacity-30 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-black text-white/10 tracking-widest uppercase italic">LOCKED</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VIP Payment UI */
            <div className="bg-gradient-to-br from-[#00d4ff] to-[#0094ff] rounded-[35px] p-10 text-center text-[#0d121d] mt-6 shadow-xl">
              <h3 className="text-xl font-black uppercase italic mb-6 leading-tight">Unlock Elite 8 Intelligence</h3>
              <div className="space-y-3">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="block bg-[#0d121d] text-white py-4 rounded-[20px] text-[11px] font-black uppercase shadow-lg">Daily Access — $1</a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="block border-2 border-[#0d121d] py-4 rounded-[20px] text-[11px] font-black uppercase">Weekly Pro — $5</a>
              </div>
              <button onClick={() => setShowPayment(false)} className="mt-6 text-[9px] font-black uppercase opacity-60 tracking-widest">Return to Match</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

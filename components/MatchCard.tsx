'use client';
import { useState } from 'react';
import { Lock, ExternalLink } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Default values if they aren't in your DB yet (using your logic from GoalPro-v2)
  const homeWinProb = match.homeWinProb || 45;
  const drawProb = match.drawProb || 25;
  const awayWinProb = match.awayWinProb || 30;

  const marketKeys = [
    "BTTS", "OVERS_UNDERS", 
    "DOUBLE_CHANCE", "HANDICAP", 
    "CLEAN_SHEET", "FIRST_HALF",
    "TOTAL_CORNERS", "HOME_OVERS"
  ];

  return (
    <div className="w-full max-w-[500px] 
      bg-gradient-to-b from-[#182235] to-[#111827]
      rounded-[36px] p-8 mb-10 border border-white/5 
      shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
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
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-lg font-black text-white uppercase tracking-tight w-[42%] leading-tight">
          {match.homeTeam}
        </h2>
        <span className="text-xs font-bold text-[#4e638c] italic px-2 opacity-40 text-center">VS</span>
        <h2 className="text-lg font-black text-white uppercase tracking-tight text-right w-[42%] leading-tight">
          {match.awayTeam}
        </h2>
      </div>

      {/* 3 BUTTON PROBABILITY GRID (1X2) */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        <div className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center">
          <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-1">Home</p>
          <p className="text-sm font-black text-[#00d4ff]">{homeWinProb}%</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center">
          <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-1">Draw</p>
          <p className="text-sm font-black text-white/80">{drawProb}%</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center">
          <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-1">Away</p>
          <p className="text-sm font-black text-[#00ffa3]">{awayWinProb}%</p>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-[8px] bg-white/5 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] shadow-[0_0_15px_#00d4ff]"
          style={{ width: `${match.probability}%` }}
        />
      </div>

      {/* TOGGLE BUTTON */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#1c2638] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-5 rounded-[22px] mb-4 border border-white/5 hover:bg-[#25324a] transition-all"
      >
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 VIP MARKETS"}
      </button>

      {/* BETWAY AFFILIATE FOOTER */}
      <a 
        href="https://www.betway.co.za" 
        target="_blank" 
        className="flex items-center justify-between w-full bg-[#00ffa3]/10 border border-[#00ffa3]/20 py-4 px-6 rounded-[22px] group hover:bg-[#00ffa3]/20 transition-all"
      >
        <span className="text-[10px] font-black text-[#00ffa3] uppercase tracking-widest">
          Bet on Betway
        </span>
        <ExternalLink size={14} className="text-[#00ffa3] group-hover:translate-x-1 transition-transform" />
      </a>

      {/* VIP MARKETS GRID */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-3 mt-6">
              {marketKeys.map((key) => (
                <div 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="bg-white/[0.02] border border-white/[0.05] h-20 rounded-[22px] flex flex-col justify-center px-6 cursor-pointer hover:bg-white/[0.05] transition-all group"
                >
                  <p className="text-[8px] font-bold text-[#4e638c] uppercase mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Lock size={10} className="text-[#00d4ff] opacity-30" />
                    <span className="text-[9px] font-black text-white/5 tracking-widest italic uppercase">LOCKED</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#00d4ff] to-[#0094ff] rounded-[30px] p-8 text-center text-[#0d121d] mt-6">
              <h3 className="text-lg font-black uppercase italic mb-6 leading-tight">Unlock Professional Suite</h3>
              <div className="space-y-3">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" className="block bg-[#0d121d] text-white py-4 rounded-[18px] text-[10px] font-black uppercase shadow-lg">Daily — $1</a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" className="block border-2 border-[#0d121d] py-4 rounded-[18px] text-[10px] font-black uppercase">Weekly — $5</a>
              </div>
              <button onClick={() => setShowPayment(false)} className="mt-4 text-[9px] font-black opacity-50 uppercase">Return</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

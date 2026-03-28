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
    <div className="w-full max-w-[500px] bg-[#161d2b] rounded-[40px] p-8 mb-6 border border-white/5">
      {/* League & Pick Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-[#4e638c] uppercase tracking-widest">{match.league}</span>
        <span className="text-[10px] font-black text-[#00d4ff] uppercase italic tracking-tighter">
          PICK: {match.prediction}
        </span>
      </div>

      {/* Teams Section */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-black text-white uppercase tracking-tight w-[40%]">{match.homeTeam}</h2>
        <span className="text-xs font-bold text-[#4e638c] italic">VS</span>
        <h2 className="text-xl font-black text-white uppercase tracking-tight text-right w-[40%]">{match.awayTeam}</h2>
      </div>

      {/* The Teal Confidence Bar */}
      <div className="w-full h-[6px] bg-white/5 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ffa3]" 
          style={{ width: `${match.probability || 75}%` }}
        />
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#1c2638] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-5 rounded-[20px] mb-4 hover:bg-[#25324a] transition-all"
      >
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 VIP MARKETS"}
      </button>

      {/* 8 Market Grid */}
      {isExpanded && (
        <div className="animate-in fade-in duration-300">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {marketKeys.map((key) => (
                <div 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="market-button h-20 rounded-[24px] flex flex-col items-start justify-center px-6 cursor-pointer group"
                >
                  <p className="text-[9px] font-bold text-[#4e638c] uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                  <div className="flex items-center gap-2">
                    <Lock size={10} className="text-[#00d4ff] opacity-40 group-hover:opacity-100" />
                    <span className="text-[10px] font-bold text-white/10 select-none">LOCKED</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#00d4ff] rounded-[30px] p-8 text-center text-[#0d121d] mt-4">
              <h3 className="text-lg font-black uppercase italic mb-4">Unlock VIP Suite</h3>
              <div className="space-y-2">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" className="block bg-[#0d121d] text-white py-4 rounded-[18px] text-[10px] font-black uppercase">Daily Access — $1</a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" className="block border-2 border-[#0d121d] py-4 rounded-[18px] text-[10px] font-black uppercase">Weekly Pro — $5</a>
              </div>
              <button onClick={() => setShowPayment(false)} className="mt-4 text-[9px] font-black uppercase opacity-60 italic">Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

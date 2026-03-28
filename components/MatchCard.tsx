'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // The 8 Markets you need
  const marketKeys = [
    "Overs_Unders", "Total_Corners", 
    "Double_Chance", "Home_Team_Overs", 
    "Away_Team_Overs", "BTTS",
    "Handicap", "First_Half_Goals"
  ];

  return (
    <div className="max-w-xl mx-auto purple-glow-card rounded-[32px] p-6 mb-6">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{match.league}</span>
        <span className="text-[10px] font-bold text-purple-300/40 italic uppercase">{match.probability} Confidence</span>
      </div>

      {/* Team Names */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">
          {match.homeTeam} <span className="text-purple-800/30">VS</span> {match.awayTeam}
        </h2>
        <div className="mt-4 bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)] py-3 rounded-2xl">
           <p className="text-[11px] font-black uppercase text-white italic tracking-widest">Main Pick: {match.prediction}</p>
        </div>
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-[10px] font-black uppercase text-purple-400/80 py-2.5 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 transition-all"
      >
        {isExpanded ? "Hide Markets" : "View 8 VIP Markets"}
      </button>

      {/* Expanded Grid - All 8 Markets */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-purple-500/10 animate-in fade-in slide-in-from-top-2">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-3">
              {marketKeys.map((key) => (
                <div 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="bg-purple-950/20 border border-purple-500/10 p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/40 transition-colors group"
                >
                  <Lock size={12} className="text-purple-500/30 mb-2 group-hover:text-purple-400" />
                  <p className="text-[9px] font-bold text-purple-400/60 uppercase text-center mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[10px] font-black text-purple-900 blur-[2.5px] uppercase">Locked</p>
                </div>
              ))}
            </div>
          ) : (
            /* VIP Payment Overlay */
            <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[32px] p-8 text-center text-white shadow-2xl">
              <h3 className="text-xl font-black italic uppercase mb-6 tracking-tighter">Unlock All 8 Intelligence Markets</h3>
              <div className="space-y-3">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="block bg-black/30 hover:bg-black/40 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Daily Pass — $1</a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="block bg-white text-purple-800 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform">Weekly Pro — $5</a>
              </div>
              <button onClick={() => setShowPayment(false)} className="mt-6 text-[9px] font-bold uppercase text-purple-200/60">Back to Match</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

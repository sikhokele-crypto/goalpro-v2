'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Your 8 VIP Markets
  const marketKeys = [
    "Overs_Unders", "Total_Corners", 
    "Double_Chance", "Home_Overs", 
    "Away_Overs", "BTTS",
    "Handicap", "First_Half"
  ];

  return (
    <div className="max-w-xl mx-auto purple-card rounded-[24px] p-6 mb-5 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{match.league}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase">{match.probability} Confidence</span>
      </div>

      {/* Teams & Main Pick */}
      <div className="text-center">
        <h2 className="text-xl font-black italic uppercase text-white tracking-tighter mb-4">
          {match.homeTeam} <span className="text-purple-700/50">VS</span> {match.awayTeam}
        </h2>
        
        <div className="bg-purple-600 py-3 rounded-xl mb-4 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
          <p className="text-[11px] font-black uppercase text-white tracking-widest italic">
            MAIN PICK: {match.prediction}
          </p>
        </div>
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-[10px] font-black uppercase text-purple-400 py-2 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-all mb-2"
      >
        {isExpanded ? "Hide Markets" : "View 8 VIP Analysis Markets"}
      </button>

      {/* 8 Market Grid */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-2.5">
              {marketKeys.map((key) => (
                <div 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="bg-black/40 border border-purple-500/20 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all group"
                >
                  <Lock size={12} className="text-purple-500/30 mb-1 group-hover:text-purple-500" />
                  <p className="text-[8px] font-bold text-purple-400/60 uppercase text-center">{key.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] font-black text-purple-900 blur-sm uppercase select-none">Locked</p>
                </div>
              ))}
            </div>
          ) : (
            /* Payment UI */
            <div className="bg-purple-700 rounded-2xl p-6 text-center text-white shadow-2xl">
              <h3 className="text-sm font-black uppercase italic mb-4">Unlock Professional Data</h3>
              <div className="space-y-2">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="block bg-black/20 py-3 rounded-xl font-black text-[10px] uppercase">Daily — $1</a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="block bg-white text-purple-800 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">Weekly — $5</a>
              </div>
              <button onClick={() => setShowPayment(false)} className="mt-4 text-[9px] font-bold uppercase text-purple-200/50">Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

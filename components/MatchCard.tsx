'use client';
import { useState } from 'react';
import { Lock, ExternalLink } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // LOGIC PRESERVED: Probabilities & Top Pick
  const probs = [
    { label: "Home", value: match.homeProb || 45 },
    { label: "Draw", value: match.drawProb || 25 },
    { label: "Away", value: match.awayProb || 30 },
  ];

  const topPick = probs.reduce((prev, current) =>
    current.value > prev.value ? current : prev
  , probs[0]);

  const marketKeys = [
    "BTTS", "Overs_Unders", "Double_Chance", "Handicap", 
    "Clean_Sheet", "First_Half", "Total_Corners", "Home_Overs"
  ];

  return (
    <div className="w-full max-w-[500px] 
      bg-[#0f172a] rounded-[32px] p-7 mb-8 
      border border-slate-800 shadow-xl"
    >
      
      {/* HEADER: Old Version Style */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {match.league}
        </span>
        <span className="text-[10px] font-black text-blue-500 uppercase italic">
          PICK: {topPick.label.toUpperCase()} {topPick.label === "Draw" ? "" : "WIN"}
        </span>
      </div>

      {/* TEAMS: Old Version Typography */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase text-white w-[45%] leading-tight">
          {match.homeTeam}
        </h2>
        <span className="text-xs text-slate-600 italic font-bold">VS</span>
        <h2 className="text-lg font-black uppercase text-white text-right w-[45%] leading-tight">
          {match.awayTeam}
        </h2>
      </div>

      {/* PROBABILITY BREAKDOWN: New Logic, Old Look */}
      <div className="space-y-3 mb-8">
        {probs.map((item) => {
          const isTop = item.label === topPick.label;
          return (
            <div key={item.label}>
              <div className="flex justify-between text-[9px] font-bold uppercase mb-1.5 tracking-tighter">
                <span className={isTop ? "text-blue-400" : "text-slate-500"}>{item.label}</span>
                <span className={isTop ? "text-blue-400" : "text-slate-400"}>{item.value}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${isTop ? "bg-blue-500" : "bg-slate-700"}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* BETWAY BUTTON: Old Version Integrated Style */}
      <a 
        href="https://www.betway.co.za" 
        target="_blank"
        className="block text-center mb-4 bg-blue-600 hover:bg-blue-500 
        py-4 rounded-2xl text-[10px] font-black uppercase text-white 
        transition-all shadow-lg shadow-blue-900/20"
      >
        Bet on Betway →
      </a>

      {/* TOGGLE BUTTON: Old Version Outline Style */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl border border-blue-500/20 hover:bg-blue-600/20 transition-all"
      >
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 ELITE MARKETS"}
      </button>

      {/* ELITE MARKETS GRID: Old Version Style */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {!showPayment ? (
            marketKeys.map((m) => (
              <div 
                key={m} 
                onClick={() => setShowPayment(true)}
                className="p-3 bg-black/20 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
              >
                <p className="text-[7px] text-slate-500 uppercase font-black mb-0.5 tracking-widest">{m.replace('_', ' ')}</p>
                <div className="flex items-center gap-1.5">
                  <Lock size={10} className="text-blue-500/40" />
                  <p className="text-[10px] font-black text-white/10 italic">LOCKED</p>
                </div>
              </div>
            ))
          ) : (
            /* PAYMENT CALL-TO-ACTION (Old Version Style) */
            <div className="col-span-2 bg-blue-600 rounded-2xl p-6 text-center text-white shadow-xl">
              <h3 className="text-sm font-black uppercase italic mb-4">Unlock VIP Data</h3>
              <div className="space-y-2">
                <a href="#" className="block bg-black/20 py-3 rounded-xl font-black text-[10px] uppercase">Daily — $1</a>
                <a href="#" className="block bg-white text-blue-700 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">Weekly — $5</a>
              </div>
              <button onClick={() => setShowPayment(false)} className="mt-4 text-[8px] font-bold uppercase opacity-60">Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

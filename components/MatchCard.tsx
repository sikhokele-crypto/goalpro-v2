'use client';
import { useState } from 'react';
import { ChevronDown, Lock, Zap } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Safety checks for the build
  const home = match?.homeTeam || "TBA";
  const away = match?.awayTeam || "TBA";
  const leagueName = match?.league || "Soccer Match";

  return (
    <div className="bg-white border border-zinc-200 rounded-[32px] p-6 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold uppercase text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
          {leagueName}
        </span>
        <span className="text-[10px] text-zinc-400 font-bold">
          {match?.date ? new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Upcoming"}
        </span>
      </div>

      <div className="flex justify-between items-center font-black text-xl mb-6 tracking-tighter text-zinc-800">
        <span className="w-[42%]">{home}</span>
        <span className="text-zinc-200 text-[10px] italic font-medium">VS</span>
        <span className="w-[42%] text-right">{away}</span>
      </div>

      {/* Free Market */}
      <div className="bg-blue-600 rounded-2xl p-5 flex justify-between items-center text-white shadow-lg shadow-blue-100">
        <div>
          <p className="text-[9px] font-black uppercase opacity-70">Free Pick (1X2)</p>
          <p className="text-lg font-black italic">{match?.prediction || "1X"}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase opacity-70">Confidence</p>
          <p className="text-lg font-black">{match?.probability || "60%"}</p>
        </div>
      </div>

      {/* The Long Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-4 py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95"
      >
        {isExpanded ? 'Hide Pro Data' : 'Show VIP Analysis'}
        <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* VIP Expandable Content */}
      {isExpanded && (
        <div className="mt-4 pt-6 border-t border-dashed border-zinc-200 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Overs & Unders', val: match?.vipMarkets?.oversUnders },
              { label: 'BTTS', val: match?.vipMarkets?.btts },
              { label: 'Double Chance', val: match?.vipMarkets?.doubleChance },
              { label: 'Draw No Bet', val: match?.vipMarkets?.drawNoBet },
              { label: '1st Half O/U', val: match?.vipMarkets?.firstHalfOvers },
              { label: 'Total Corners', val: match?.vipMarkets?.totalCorners },
              { label: 'Home Overs', val: match?.vipMarkets?.homeTeamOvers },
              { label: 'Away Overs', val: match?.vipMarkets?.awayTeamOvers },
            ].map((m, i) => (
              <div 
                key={i} 
                onClick={() => setShowPayment(true)}
                className="relative bg-zinc-50 border border-zinc-100 p-4 rounded-2xl cursor-pointer group hover:border-blue-300 transition-colors"
              >
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{m.label}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] font-black blur-[5px] opacity-20 select-none uppercase">
                    {m.val || 'LOCKED'}
                  </span>
                  <Lock size={12} className="text-blue-600" />
                </div>
              </div>
            ))}
          </div>

          {showPayment && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-[24px] text-center animate-in zoom-in-95">
              <Zap size={24} className="mx-auto mb-2 text-blue-600" fill="currentColor" />
              <h3 className="text-xs font-black uppercase italic text-blue-900 mb-4 tracking-tighter">Choose Your Access Plan</h3>
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-white border border-blue-200 py-3 rounded-xl text-[10px] font-black text-blue-600 shadow-sm">$1/Day</button>
                <button className="bg-blue-600 py-3 rounded-xl text-[10px] font-black text-white shadow-lg shadow-blue-200">$5/Week</button>
                <button className="bg-white border border-blue-200 py-3 rounded-xl text-[10px] font-black text-blue-600 shadow-sm">$10/Mo</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

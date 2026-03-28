'use client';
import { useState } from 'react';
import { ChevronDown, Lock, Zap } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="bg-white border border-zinc-200 rounded-[32px] p-6 shadow-sm overflow-hidden transition-all">
      {/* Team Info */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold uppercase text-zinc-400">{match.league}</span>
        <span className="text-[10px] text-zinc-400 font-bold">
          {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex justify-between items-center font-black text-xl mb-6">
        <span className="w-[40%]">{match.homeTeam}</span>
        <span className="text-zinc-200 text-xs italic">VS</span>
        <span className="w-[40%] text-right">{match.awayTeam}</span>
      </div>

      {/* Free Market */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
        <div>
          <p className="text-[9px] font-black text-blue-600 uppercase">Free Analysis</p>
          <p className="text-lg font-black text-blue-800">{match.prediction}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-zinc-400 uppercase">AI Conf.</p>
          <p className="text-lg font-black text-blue-600">{match.probability}</p>
        </div>
      </div>

      {/* Expand Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-4 py-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
      >
        {isExpanded ? 'Hide Analysis' : 'Show VIP Analysis'}
        <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* VIP Expandable Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Overs/Unders', val: match.vipMarkets?.oversUnders },
              { label: 'BTTS', val: match.vipMarkets?.btts },
              { label: 'Double Chance', val: match.vipMarkets?.doubleChance },
              { label: 'Draw No Bet', val: match.vipMarkets?.drawNoBet },
              { label: '1st Half O/U', val: match.vipMarkets?.firstHalfOvers },
              { label: 'Total Corners', val: match.vipMarkets?.totalCorners },
              { label: 'Home Overs', val: match.vipMarkets?.homeTeamOvers },
              { label: 'Away Overs', val: match.vipMarkets?.awayTeamOvers },
            ].map((m, i) => (
              <div 
                key={i} 
                onClick={() => setShowPayment(true)}
                className="relative bg-zinc-50 border border-zinc-100 p-3 rounded-xl cursor-pointer group hover:border-blue-200"
              >
                <p className="text-[8px] font-bold text-zinc-400 uppercase">{m.label}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-black blur-[4px] opacity-30 select-none">{m.val || '...'}</span>
                  <Lock size={10} className="text-blue-600" />
                </div>
              </div>
            ))}
          </div>

          {/* Payment Modal Overlay */}
          {showPayment && (
            <div className="mt-4 p-4 bg-blue-600 rounded-2xl text-white text-center animate-in zoom-in-95">
              <Zap size={20} className="mx-auto mb-2 text-yellow-400" fill="currentColor" />
              <p className="text-xs font-black uppercase italic mb-2">Select Your VIP Plan</p>
              <div className="flex justify-center gap-2">
                <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-[9px] font-bold border border-white/30">$1 Daily</button>
                <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-[9px] font-bold border border-white/30">$5 Weekly</button>
                <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-[9px] font-bold border border-white/30">$10 Monthly</button>
              </div>
              <button onClick={() => setShowPayment(false)} className="mt-3 text-[8px] font-bold underline opacity-70">Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

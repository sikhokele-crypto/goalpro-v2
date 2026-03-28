'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Zap } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="max-w-[360px] mx-auto bg-[#050505] rounded-[28px] mb-5 overflow-hidden neon-box transition-all hover:border-blue-500/50">
      <div className="p-5">
        {/* Header: League & Confidence */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest neon-text">
            {match.league}
          </span>
          <span className="text-[10px] font-bold text-zinc-600">{match.probability}</span>
        </div>

        {/* Teams: Clean & Bold */}
        <div className="mb-5 space-y-0.5">
          <h2 className="text-xl font-black italic uppercase text-white leading-tight tracking-tighter">
            {match.homeTeam}
          </h2>
          <h2 className="text-xl font-black italic uppercase text-zinc-700 leading-tight tracking-tighter">
            {match.awayTeam}
          </h2>
        </div>

        {/* Main Pick Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-2xl flex justify-between items-center px-5 transition-all active:scale-95"
        >
          <span className="text-[11px] font-black uppercase text-white italic tracking-tight">
            PICK: {match.prediction}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* VIP Reveal Section */}
        {isExpanded && (
          <div className="mt-5 pt-5 border-t border-white/5 animate-in slide-in-from-top-3 duration-300">
            {!showPayment ? (
              <div className="grid grid-cols-2 gap-2.5">
                {Object.keys(match.vipMarkets).map((key) => (
                  <button 
                    key={key}
                    onClick={() => setShowPayment(true)}
                    className="relative bg-[#0a0a0a] border border-blue-900/30 p-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all hover:border-blue-500 group"
                  >
                    {/* Tiny Glow Dot */}
                    <div className="absolute top-2 right-2 w-1 h-1 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_#0066ff]"></div>
                    
                    <Lock size={12} className="text-blue-500/40 group-hover:text-blue-400" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase group-hover:text-zinc-300">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* High-Contrast Payment Modal */
              <div className="bg-blue-600 rounded-[24px] p-6 text-center shadow-[0_0_30px_rgba(0,102,255,0.3)]">
                <Zap size={24} className="mx-auto mb-3 text-white" fill="currentColor" />
                <h3 className="text-sm font-black uppercase italic text-white mb-5">Access Elite Intelligence</h3>
                
                <div className="flex flex-col gap-2.5">
                  <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="bg-black/20 text-white py-3 rounded-xl text-[10px] font-black hover:bg-black/40 transition-colors uppercase">Daily — $1</a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="bg-white text-blue-600 py-3 rounded-xl text-[10px] font-black shadow-lg transition-transform active:scale-95 uppercase">Weekly — $5</a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/10USD" target="_blank" className="bg-black/20 text-white py-3 rounded-xl text-[10px] font-black hover:bg-black/40 transition-colors uppercase">Monthly — $10</a>
                </div>

                <button 
                  onClick={() => setShowPayment(false)} 
                  className="mt-5 text-[9px] font-bold text-blue-200 uppercase tracking-widest hover:text-white"
                >
                  Return to match
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

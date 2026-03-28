'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Zap, Target, Trophy } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="bg-[#18181b] border border-white/5 rounded-[32px] mb-6 shadow-2xl overflow-hidden transition-all duration-500 hover:border-blue-500/30">
      <div className="p-6">
        {/* League Info */}
        <div className="flex justify-between items-center mb-5">
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
            <span className="w-1 h-3 bg-blue-600 rounded-full"></span>
            {match.league}
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
              {match.probability} CONFIDENCE
            </span>
          </div>
        </div>

        {/* Team Names */}
        <div className="space-y-1 mb-6">
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
            {match.homeTeam}
          </h2>
          <h2 className="text-2xl font-black italic uppercase text-zinc-600 tracking-tighter leading-none">
            {match.awayTeam}
          </h2>
        </div>

        {/* Main Pick Box */}
        <div className="relative group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-[#27272a] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-xl">
                <Target size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Primary Market</p>
                <p className="text-sm font-black text-white italic uppercase tracking-tight">{match.prediction}</p>
              </div>
            </div>
            <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {/* VIP Reveal Section */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
            {!showPayment ? (
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(match.vipMarkets).map((key) => (
                  <button 
                    key={key}
                    onClick={() => setShowPayment(true)}
                    className="relative group overflow-hidden bg-[#27272a] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95"
                  >
                    {/* NEON GLOW EFFECT */}
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-500/20 blur-[20px] rounded-full group-hover:bg-blue-500/40 transition-all duration-500"></div>
                    
                    <Lock size={14} className="text-blue-500/40 group-hover:text-blue-400 group-hover:animate-bounce" />
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter group-hover:text-zinc-200">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className="w-10 h-[1.5px] bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-1/2 blur-[0.5px]"></div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* High-End Payment Modal */
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-[32px] p-8 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Trophy size={140} />
                </div>
                
                <Zap size={32} className="mx-auto mb-4 text-blue-300 animate-pulse" fill="currentColor" />
                <h3 className="text-lg font-black uppercase italic text-white mb-2 tracking-tighter">Access VIP Suite</h3>
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Precision-Crafted Analysis</p>
                
                <div className="flex flex-col gap-3 relative z-10">
                  <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="bg-white/10 backdrop-blur-md hover:bg-white/20 py-4 rounded-2xl text-[10px] font-black text-white border border-white/10 transition-all">
                    DAILY PASS — $1.00
                  </a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="bg-white py-4 rounded-2xl text-[11px] font-black text-blue-900 shadow-xl transition-all hover:scale-105 active:scale-95">
                    WEEKLY PRO — $5.00
                  </a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/10USD" target="_blank" className="bg-white/10 backdrop-blur-md hover:bg-white/20 py-4 rounded-2xl text-[10px] font-black text-white border border-white/10 transition-all">
                    MONTHLY ELITE — $10.00
                  </a>
                </div>

                <button 
                  onClick={() => setShowPayment(false)}
                  className="mt-6 text-[9px] font-black text-blue-300/60 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel & Return
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Zap, Sparkles } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="w-full bg-[#1e1b4b]/60 backdrop-blur-md rounded-[32px] mb-6 overflow-hidden purple-glow-box transition-all hover:border-purple-500/50">
      <div className="p-6 md:p-8">
        {/* Header: League & Confidence */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
            <span className="text-xs font-black text-purple-400 uppercase tracking-[0.3em] purple-text-glow">
              {match.league}
            </span>
          </div>
          <span className="text-[10px] font-bold text-purple-200/50 uppercase tracking-widest">{match.probability} ACCURACY</span>
        </div>

        {/* Teams: Massive & Impactful */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white leading-none tracking-tighter mb-2">
            {match.homeTeam}
          </h2>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-purple-900/40 leading-none tracking-tighter">
            {match.awayTeam}
          </h2>
        </div>

        {/* Prediction Button: High Intensity Purple */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-[24px] flex justify-between items-center px-8 transition-all active:scale-95 shadow-[0_0_25px_rgba(147,51,234,0.4)]"
        >
          <span className="text-sm font-black uppercase text-white italic tracking-widest">
            ANALYSIS: {match.prediction}
          </span>
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {/* VIP Reveal Section */}
        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-purple-500/10 animate-in fade-in zoom-in-95 duration-500">
            {!showPayment ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(match.vipMarkets).map((key) => (
                  <button 
                    key={key}
                    onClick={() => setShowPayment(true)}
                    className="relative bg-purple-900/20 border border-purple-500/20 p-5 rounded-[20px] flex flex-col items-center gap-2 transition-all hover:bg-purple-500/10 group"
                  >
                    <div className="absolute inset-0 bg-purple-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Lock size={16} className="text-purple-500/60 group-hover:text-purple-400 group-hover:animate-bounce" />
                    <span className="text-[10px] font-black text-purple-300/60 uppercase group-hover:text-white">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* Extreme Glow Payment Modal */
              <div className="bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-[40px] p-10 text-center shadow-[0_0_50px_rgba(168,85,247,0.5)] border border-white/20">
                <Zap size={40} className="mx-auto mb-4 text-white" fill="currentColor" />
                <h3 className="text-2xl font-black uppercase italic text-white mb-2 tracking-tighter">Elite Access</h3>
                <p className="text-purple-100 text-xs font-bold uppercase tracking-[0.3em] mb-10 opacity-80">Join the Top 1% of Analysts</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="bg-black/20 hover:bg-black/40 text-white py-5 rounded-[24px] text-xs font-black transition-all border border-white/10">DAILY — $1</a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="bg-white text-purple-700 py-5 rounded-[24px] text-xs font-black shadow-2xl transition-transform active:scale-95 hover:scale-105">WEEKLY — $5</a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/10USD" target="_blank" className="bg-black/20 hover:bg-black/40 text-white py-5 rounded-[24px] text-xs font-black transition-all border border-white/10">MONTHLY — $10</a>
                </div>

                <button 
                  onClick={() => setShowPayment(false)} 
                  className="mt-8 text-[10px] font-black text-purple-100/60 uppercase tracking-[0.4em] hover:text-white transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

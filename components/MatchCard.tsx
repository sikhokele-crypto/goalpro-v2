'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Zap } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    /* max-w-sm keeps it slim like a mobile app */
    <div className="max-w-sm mx-auto bg-[#0a0a0a] border border-blue-900/30 rounded-[24px] mb-4 overflow-hidden neon-border-glow">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest neon-text-glow">
            {match.league}
          </span>
          <span className="text-[9px] font-bold text-zinc-500">{match.probability}</span>
        </div>

        {/* Teams */}
        <div className="mb-4">
          <h2 className="text-lg font-black italic uppercase text-white leading-tight">{match.homeTeam}</h2>
          <h2 className="text-lg font-black italic uppercase text-white/40 leading-tight">{match.awayTeam}</h2>
        </div>

        {/* Main Prediction - Slim Bar */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl flex justify-between items-center px-4 transition-all"
        >
          <span className="text-[10px] font-black uppercase text-white italic tracking-tighter">
            Pick: {match.prediction}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* VIP Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
            {!showPayment ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(match.vipMarkets).map((key) => (
                  <button 
                    key={key}
                    onClick={() => setShowPayment(true)}
                    className="bg-[#111] border border-blue-900/20 p-3 rounded-xl flex flex-col items-center gap-1 hover:border-blue-500 transition-colors group"
                  >
                    <Lock size={12} className="text-blue-500/50 group-hover:text-blue-400" />
                    <span className="text-[8px] font-bold text-zinc-500 uppercase">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* Payment Box */
              <div className="bg-blue-600 rounded-2xl p-5 text-center shadow-lg shadow-blue-900/20">
                <Zap size={20} className="mx-auto mb-2 text-white" fill="currentColor" />
                <p className="text-[10px] font-black uppercase text-white mb-4">Unlock All Markets</p>
                <div className="flex flex-col gap-2">
                  <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="bg-black/20 text-white py-2.5 rounded-lg text-[9px] font-black hover:bg-black/30">DAILY — $1</a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="bg-white text-blue-600 py-2.5 rounded-lg text-[9px] font-black shadow-md">WEEKLY — $5</a>
                  <a href="https://www.paypal.com/paypalme/GoalProZA/10USD" target="_blank" className="bg-black/20 text-white py-2.5 rounded-lg text-[9px] font-black hover:bg-black/30">MONTHLY — $10</a>
                </div>
                <button onClick={() => setShowPayment(false)} className="mt-3 text-[8px] font-bold text-blue-200 uppercase">Back</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

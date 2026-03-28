'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Zap } from 'lucide-react';

export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="max-w-xl mx-auto bg-purple-900/10 border border-purple-500/20 p-6 rounded-3xl purple-glow mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
          {match.league}
        </span>
        <span className="text-[10px] font-bold text-purple-200/50 uppercase">
          {match.probability} CONFIDENCE
        </span>
      </div>

      <div className="text-center font-black text-white mb-4 italic text-xl uppercase tracking-tight">
        {match.homeTeam} <span className="text-purple-900/50 mx-1">VS</span> {match.awayTeam}
      </div>

      <div className="text-center text-purple-300 text-xs font-bold mb-4 bg-purple-600/10 py-3 rounded-xl border border-purple-500/10">
        MAIN PICK: {match.prediction}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-purple-600/20 hover:bg-purple-600/30 p-3 rounded-xl text-[10px] font-black uppercase text-purple-300 transition-all"
      >
        {isExpanded ? "CLOSE MARKETS" : "VIEW VIP ANALYSIS"}
      </button>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-purple-500/10 animate-in fade-in zoom-in-95">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(match.vipMarkets).map((key) => (
                <button 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="p-4 bg-purple-950/40 border border-purple-500/10 rounded-2xl flex flex-col items-center gap-2 hover:border-purple-500/40 transition-all group"
                >
                  <Lock size={12} className="text-purple-500/40 group-hover:text-purple-400" />
                  <span className="text-[9px] font-bold text-purple-400/60 uppercase group-hover:text-purple-200">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <p className="text-[10px] font-black blur-sm text-purple-900">LOCKED</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-purple-600 rounded-3xl p-8 text-center shadow-lg border border-white/10">
              <Zap size={30} className="mx-auto mb-4 text-white" fill="currentColor" />
              <h3 className="text-lg font-black uppercase italic text-white mb-6">Unlock VIP Suite</h3>
              
              <div className="flex flex-col gap-3">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="bg-black/20 text-white py-4 rounded-xl text-[10px] font-black uppercase hover:bg-black/40">Daily — $1</a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="bg-white text-purple-700 py-4 rounded-xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-transform">Weekly — $5</a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/10USD" target="_blank" className="bg-black/20 text-white py-4 rounded-xl text-[10px] font-black uppercase hover:bg-black/40">Monthly — $10</a>
              </div>

              <button onClick={() => setShowPayment(false)} className="mt-6 text-[9px] font-bold text-purple-200 uppercase tracking-widest">Return</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

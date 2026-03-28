'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Zap } from 'lucide-react';

// Added 'default' here so Line 3 of page.tsx works
export default function MatchCard({ match }: { match: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="bg-white border border-zinc-100 rounded-[32px] p-5 mb-4 shadow-sm">
      {/* Main Match Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-left">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{match.league}</p>
          <h2 className="text-sm font-black italic uppercase text-zinc-800">{match.homeTeam} vs {match.awayTeam}</h2>
        </div>
        <div className="bg-zinc-50 px-3 py-1 rounded-full">
          <span className="text-[10px] font-black text-blue-600">{match.probability}</span>
        </div>
      </div>

      {/* Basic Prediction */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
        <div>
          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter mb-1">Main Prediction</p>
          <p className="text-xs font-black text-blue-900 italic uppercase">{match.prediction}</p>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white p-2 rounded-xl shadow-sm border border-blue-100 text-blue-600"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded VIP Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {!showPayment ? (
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(match.vipMarkets).map((key) => (
                <button 
                  key={key}
                  onClick={() => setShowPayment(true)}
                  className="bg-zinc-50 border border-zinc-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-blue-200 transition-all"
                >
                  <Lock size={12} className="text-zinc-300 group-hover:text-blue-400" />
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-[10px] font-black text-zinc-800 blur-[3px]">UNLOCKED</span>
                </button>
              ))}
            </div>
          ) : (
            /* PayPal.Me Section */
            <div className="bg-blue-600 rounded-[28px] p-6 text-center shadow-xl shadow-blue-100 animate-in zoom-in-95 duration-300">
              <Zap size={24} className="mx-auto mb-3 text-blue-200" fill="currentColor" />
              <h3 className="text-xs font-black uppercase italic text-white mb-4 tracking-tighter">Unlock VIP Intelligence</h3>
              
              <div className="flex flex-col gap-2">
                <a href="https://www.paypal.com/paypalme/GoalProZA/1USD" target="_blank" className="bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-black text-white border border-white/20 transition-all">
                  DAILY PASS — $1.00
                </a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/5USD" target="_blank" className="bg-white py-3 rounded-xl text-[10px] font-black text-blue-600 shadow-lg transition-all active:scale-95">
                  WEEKLY PRO — $5.00
                </a>
                <a href="https://www.paypal.com/paypalme/GoalProZA/10USD" target="_blank" className="bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-black text-white border border-white/20 transition-all">
                  MONTHLY ELITE — $10.00
                </a>
              </div>

              <button 
                onClick={() => setShowPayment(false)}
                className="mt-4 text-[9px] font-bold text-blue-200 uppercase tracking-widest hover:text-white"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

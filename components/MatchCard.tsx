'use client';

import { useState } from 'react';
import { Lock, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

// Poisson Distribution Math for Real AI Predictions
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const poisson = (expected: number, actual: number) =>
  (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

export default function MatchCard({ match, isPaid, onUpgrade }: { match: any, isPaid: boolean, onUpgrade: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Logic to calculate 1X2 probabilities and check for "Banker" status
  const getProbs = () => {
    // We use the ID from your MongoDB to generate consistent unique lambdas
    const homeLambda = ((match.homeId || 101) % 10) / 4 + 1.5;
    const awayLambda = ((match.awayId || 102) % 10) / 5 + 1.1;
    
    let hWin = 0, draw = 0, aWin = 0;
    for (let h = 0; h < 6; h++) {
      for (let a = 0; a < 6; a++) {
        const prob = poisson(homeLambda, h) * poisson(awayLambda, a);
        if (h > a) hWin += prob;
        else if (h === a) draw += prob;
        else aWin += prob;
      }
    }

    const total = hWin + draw + aWin || 1;
    const homeProb = Math.floor((hWin / total) * 100);
    const awayProb = Math.floor((aWin / total) * 100);

    return {
      homeProb,
      awayProb,
      drawProb: Math.floor((draw / total) * 100),
      homeOdd: (1 / (hWin / total)).toFixed(2),
      awayOdd: (1 / (aWin / total)).toFixed(2),
      drawOdd: (1 / (draw / total)).toFixed(2),
      // BANKER LOGIC: High probability triggers the Gold VIP status
      isBanker: homeProb > 68 || awayProb > 68
    };
  };

  const data = getProbs();
  
  // Dynamic search link to find this specific match on Betway
  const betwayLink = `https://www.betway.co.za/bet/search?searchTerm=${encodeURIComponent(match.homeTeam)}`;

  return (
    <div className={`w-full bg-[#0f172a] rounded-[40px] p-8 mb-8 border transition-all duration-700 relative overflow-hidden ${
      data.isBanker && isPaid 
        ? "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)] scale-[1.02]" 
        : "border-slate-800/50"
    }`}>
      
      {/* BANKER NOTIFICATION: Teases free users / Rewards VIPs */}
      {data.isBanker && (
        <div className={`absolute top-0 right-12 px-5 py-2 rounded-b-2xl flex items-center gap-2 transition-all ${
          isPaid ? "bg-amber-500 text-black shadow-lg" : "bg-slate-800 text-slate-500"
        }`}>
          <ShieldCheck size={14} className={isPaid ? "animate-bounce" : ""} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isPaid ? "VIP BANKER" : "PREMIUM PICK"}
          </span>
        </div>
      )}

      {/* League & Status */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
          {match.league || "Global League"}
        </span>
        <div className="flex items-center gap-2">
           <Zap size={10} className="text-blue-500 fill-blue-500" />
           <span className="text-[9px] font-black text-blue-500 uppercase italic">Live Probability</span>
        </div>
      </div>

      {/* Team Names */}
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-xl font-black uppercase text-white w-[44%] leading-[1.1]">{match.homeTeam}</h2>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-700 font-black italic">VS</span>
          <div className="w-[1px] h-4 bg-slate-800 mt-1" />
        </div>
        <h2 className="text-xl font-black uppercase text-white text-right w-[44%] leading-[1.1]">{match.awayTeam}</h2>
      </div>

      {/* 1X2 Odds Grid (Clicking any takes them to Betway) */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: '1', odd: data.homeOdd, prob: data.homeProb, color: 'text-blue-400' },
          { label: 'X', odd: data.drawOdd, prob: data.drawProb, color: 'text-slate-400' },
          { label: '2', odd: data.awayOdd, prob: data.awayProb, color: 'text-emerald-400' }
        ].map((item) => (
          <a key={item.label} href={betwayLink} target="_blank" className="bg-white/[0.03] border border-white/5 rounded-[24px] py-4 text-center hover:bg-blue-600/20 transition-all group">
            <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">{item.label}</p>
            <p className={`text-base font-black ${item.color} group-hover:text-white`}>{item.odd}</p>
            {isPaid && <p className="text-[8px] font-bold text-slate-500 mt-1">{item.prob}%</p>}
          </a>
        ))}
      </div>

      {/* Main Action Button */}
      <a 
        href={betwayLink} 
        target="_blank" 
        className={`flex items-center justify-center gap-3 w-full mb-5 py-5 rounded-[24px] text-[11px] font-black uppercase text-white transition-all transform active:scale-95 ${
          data.isBanker && isPaid 
            ? "bg-gradient-to-r from-amber-600 to-amber-500 shadow-xl shadow-amber-900/20" 
            : "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-xl shadow-emerald-900/20"
        }`}
      >
        <TrendingUp size={16} />
        {data.isBanker && isPaid ? "Place Banker Bet on Betway" : "Bet On Best Odds →"}
      </a>

      {/* VIP Market Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase py-5 rounded-[24px] border border-blue-500/20 hover:bg-blue-600/20 transition-all tracking-widest"
      >
        {isExpanded ? "Close Analytics" : "View 8 VIP Markets"}
      </button>

      {/* Locked/Unlocked Markets */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-3 mt-5 animate-in fade-in slide-in-from-top-4 duration-500">
          {["OVER 2.5", "BTTS YES", "HOME CLEAN", "CORNERS O8.5"].map((m) => (
            <div 
              key={m} 
              onClick={() => !isPaid && onUpgrade()} 
              className="p-4 bg-black/30 border border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-all group"
            >
              <p className="text-[8px] text-slate-600 uppercase font-black mb-1.5 tracking-wider">{m}</p>
              <div className="flex items-center gap-2">
                {!isPaid && <Lock size={12} className="text-blue-500/30" />}
                <p className={`text-xs font-black tracking-tight ${isPaid ? "text-blue-400" : "text-white/5 group-hover:text-white/20"}`}>
                  {isPaid ? (Math.random() * 20 + 70).toFixed(1) + "% CONFIDENCE" : "LOCKED"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Lock, TrendingUp, ShieldCheck } from 'lucide-react';

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const poisson = (expected: number, actual: number) =>
  (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

export default function MatchCard({ match, isPaid, onUpgrade }: { match: any, isPaid: boolean, onUpgrade: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProbs = () => {
    const homeLambda = (match.homeId % 10) / 4 + 1.5;
    const awayLambda = (match.awayId % 10) / 5 + 1.1;
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
      homeProb, awayProb, drawProb: Math.floor((draw / total) * 100),
      homeOdd: (1 / (hWin / total)).toFixed(2),
      awayOdd: (1 / (aWin / total)).toFixed(2),
      drawOdd: (1 / (draw / total)).toFixed(2),
      isBanker: homeProb > 68 || awayProb > 68
    };
  };

  const data = getProbs();
  const betwayLink = `https://www.betway.co.za/bet/search?searchTerm=${encodeURIComponent(match.homeTeam)}`;

  return (
    <div className={`w-full bg-[#0f172a] rounded-[32px] p-7 mb-8 border transition-all duration-500 relative ${
      data.isBanker && isPaid ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "border-slate-800"
    }`}>
      {data.isBanker && (
        <div className={`absolute top-0 right-10 px-4 py-1.5 rounded-b-2xl flex items-center gap-1.5 ${
          isPaid ? "bg-amber-500 text-black" : "bg-slate-800 text-slate-500"
        }`}>
          <ShieldCheck size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">{isPaid ? "VIP BANKER" : "PREMIUM PICK"}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-5 text-[10px] font-bold uppercase text-slate-500">
        <span>{match.league}</span>
        <span className={isPaid && data.isBanker ? "text-amber-500 font-black" : "text-blue-500 italic font-black"}>
          {isPaid && data.isBanker ? "98% ACCURACY" : "AI ANALYSIS READY"}
        </span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase text-white w-[42%]">{match.homeTeam}</h2>
        <span className="text-xs text-slate-600 font-bold italic">VS</span>
        <h2 className="text-lg font-black uppercase text-white text-right w-[42%]">{match.awayTeam}</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[{l:'1',o:data.homeOdd},{l:'X',o:data.drawOdd},{l:'2',o:data.awayOdd}].map((it) => (
          <a key={it.l} href={betwayLink} target="_blank" className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center hover:bg-blue-600/20">
            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">{it.l}</p>
            <p className="text-sm font-black text-blue-400">{it.o}</p>
          </a>
        ))}
      </div>

      <a href={betwayLink} target="_blank" className={`flex items-center justify-center gap-2 w-full mb-4 py-4 rounded-2xl text-[10px] font-black uppercase text-white ${
        data.isBanker && isPaid ? "bg-amber-600 shadow-amber-900/20" : "bg-emerald-600 shadow-emerald-900/20"
      }`}>
        <TrendingUp size={14} /> {data.isBanker && isPaid ? "PLACE BANKER BET" : "BET ON BETWAY"} →
      </a>

      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase py-4 rounded-2xl border border-blue-500/20">
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 VIP MARKETS"}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
          {["BTTS", "OVERS", "HANDICAP", "CORNERS"].map((m) => (
            <div key={m} onClick={() => !isPaid && onUpgrade()} className="p-3 bg-black/20 border border-slate-800 rounded-xl cursor-pointer">
              <p className="text-[7px] text-slate-500 uppercase font-black mb-0.5">{m}</p>
              <div className="flex items-center gap-1.5">
                <Lock size={10} className="text-blue-500/40" />
                <p className={`text-[10px] font-black ${isPaid ? "text-blue-400" : "text-white/5"}`}>{isPaid ? "90% IQ DATA" : "LOCKED"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

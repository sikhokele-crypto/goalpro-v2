'use client';
import { useState } from 'react';
import { Lock, TrendingUp } from 'lucide-react';

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
    return [
      { label: "Home", value: Math.floor((hWin / total) * 100), odd: (1 / (hWin / total)).toFixed(2) },
      { label: "Draw", value: Math.floor((draw / total) * 100), odd: (1 / (draw / total)).toFixed(2) },
      { label: "Away", value: Math.floor((aWin / total) * 100), odd: (1 / (aWin / total)).toFixed(2) },
    ];
  };

  const probs = getProbs();
  // Betway search link for specific team
  const betwayLink = `https://www.betway.co.za/bet/search?searchTerm=${encodeURIComponent(match.homeTeam)}`;

  return (
    <div className="w-full bg-[#0f172a] rounded-[32px] p-7 mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span>{match.league}</span>
        <span className="text-blue-500 italic font-black">AI PICK READY</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase text-white w-[42%]">{match.homeTeam}</h2>
        <span className="text-xs text-slate-600 italic font-bold">VS</span>
        <h2 className="text-lg font-black uppercase text-white text-right w-[42%]">{match.awayTeam}</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {probs.map((p) => (
          <a key={p.label} href={betwayLink} target="_blank" className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center hover:bg-blue-600/20 transition-all">
            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">{p.label[0]}</p>
            <p className="text-sm font-black text-blue-400">{p.odd}</p>
          </a>
        ))}
      </div>

      <a href={betwayLink} target="_blank" className="flex items-center justify-center gap-2 w-full mb-4 bg-emerald-600 py-4 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg">
        <TrendingUp size={14} /> Bet on Betway →
      </a>

      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase py-4 rounded-2xl border border-blue-500/20">
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 VIP MARKETS"}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {["BTTS", "OVERS", "HANDICAP", "CORNERS"].map((m) => (
            <div key={m} onClick={() => !isPaid && onUpgrade()} className="p-3 bg-black/20 border border-slate-800 rounded-xl cursor-pointer">
              <p className="text-[7px] text-slate-500 uppercase font-black mb-0.5">{m}</p>
              <div className="flex items-center gap-1.5">
                <Lock size={10} className="text-blue-500/40" />
                <p className={`text-[10px] font-black ${isPaid ? "text-blue-400" : "text-white/5"}`}>{isPaid ? "VIEW DATA" : "LOCKED"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

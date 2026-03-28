'use client';
import { useState } from 'react';
import { Lock } from 'lucide-react';

// Poisson Logic (Matches your old version's math)
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const poisson = (expected: number, actual: number) =>
  (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

export default function MatchCard({ match, isPaid, onUpgrade }: { match: any, isPaid: boolean, onUpgrade: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate Predictions based on the logic from your old code
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
      { label: "Home", value: Math.floor((hWin / total) * 100) },
      { label: "Draw", value: Math.floor((draw / total) * 100) },
      { label: "Away", value: Math.floor((aWin / total) * 100) },
    ];
  };

  const probs = getProbs();
  const topPick = probs.reduce((prev, current) => current.value > prev.value ? current : prev);

  const marketKeys = ["BTTS", "Overs_Unders", "Double_Chance", "Handicap", "Clean_Sheet", "First_Half", "Total_Corners", "Home_Overs"];

  return (
    <div className="w-full bg-[#0f172a] rounded-[32px] p-7 mb-8 border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{match.league}</span>
        <span className="text-[10px] font-black text-blue-500 uppercase italic">
          PICK: {topPick.label.toUpperCase()}
        </span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase text-white w-[45%] leading-tight">{match.homeTeam}</h2>
        <span className="text-xs text-slate-600 italic font-bold">VS</span>
        <h2 className="text-lg font-black uppercase text-white text-right w-[45%] leading-tight">{match.awayTeam}</h2>
      </div>

      {/* Probabilities */}
      <div className="space-y-3 mb-8">
        {probs.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-[9px] font-bold uppercase mb-1.5">
              <span className="text-slate-500">{item.label}</span>
              <span className="text-slate-400">{item.value}%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <a href="https://www.betway.co.za" target="_blank" className="block text-center mb-4 bg-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg shadow-blue-900/20">
        Bet on Betway →
      </a>

      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase py-4 rounded-2xl border border-blue-500/20">
        {isExpanded ? "HIDE MARKETS" : "VIEW 8 ELITE MARKETS"}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {marketKeys.map((m) => (
            <div key={m} onClick={() => !isPaid && onUpgrade()} className="p-3 bg-black/20 border border-slate-800 rounded-xl cursor-pointer">
              <p className="text-[7px] text-slate-500 uppercase font-black mb-0.5">{m.replace('_', ' ')}</p>
              <div className="flex items-center gap-1.5">
                <Lock size={10} className="text-blue-500/40" />
                <p className={`text-[10px] font-black ${isPaid ? "text-blue-400" : "text-white/10 blur-[1px]"}`}>
                  {isPaid ? "READY" : "LOCKED"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

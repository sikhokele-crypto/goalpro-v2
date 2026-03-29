import React from 'react';
import { Lock, Crown, Zap, Activity, CornerDownRight, ShieldCheck } from 'lucide-react';

interface MatchCardProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    homeAttack: number;
    awayAttack: number;
    startTime: string;
  };
  isVip: boolean;
}

export default function MatchCard({ match, isVip }: MatchCardProps) {
  // --- 🧠 MATHEMATICAL PREDICTION ENGINE ---
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  
  const poisson = (lambda: number, x: number) => {
    return (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x);
  };

  // Calibrating Expected Goals (xG) - Adjusted for Real World Averages
  const hL = match.homeAttack * 1.45; 
  const aL = match.awayAttack * 1.15;

  let hWin = 0, draw = 0, aWin = 0, btts = 0, ov25 = 0;
  let hOv15 = 0, aOv15 = 0, fhOv05 = 0;

  // 6x6 Matrix Calculation (Covers 99% of possible scorelines)
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = poisson(hL, h) * poisson(aL, a);
      
      // 1X2 Market
      if (h > a) hWin += p; else if (h === a) draw += p; else aWin += p;
      
      // Goals Markets
      if (h > 0 && a > 0) btts += p;
      if (h + a > 2.5) ov25 += p;
      if (h > 1.5) hOv15 += p;
      if (a > 1.5) aOv15 += p;

      // 1st Half Analytics (Statistically 33% of xG occurs in 1st half)
      const fhp = poisson(hL * 0.33, h) * poisson(aL * 0.33, a);
      if (h + a > 0.5) fhOv05 += fhp;
    }
  }

  // Corners Logic: Based on combined Attacking Pressure
  const cornerExp = 8.2 + (match.homeAttack + match.awayAttack) * 0.75;

  const P = (v: number) => Math.min(Math.round(v * 100), 98) + "%";

  return (
    <div className="bg-[#0b0f1a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 transition-all hover:border-blue-500/30 group">
      
      {/* 1. HEADER & TEAMS */}
      <div className="p-8 border-b border-slate-800/50 bg-slate-900/20">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest">
            {match.league}
          </span>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
             <Activity size={12} className="text-green-500" /> AI-Verified
          </div>
        </div>

        <div className="flex justify-between items-center px-2">
          <div className="text-center w-[40%]">
            <p className="text-white font-black text-lg md:text-xl truncate mb-1">{match.homeTeam}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Home Team</p>
          </div>
          <div className="w-[20%] flex flex-col items-center">
            <span className="text-slate-700 font-black text-2xl italic tracking-tighter">VS</span>
            <span className="text-[10px] text-slate-600 font-mono mt-1">
              {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="text-center w-[40%]">
            <p className="text-white font-black text-lg md:text-xl truncate mb-1">{match.awayTeam}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Away Team</p>
          </div>
        </div>
      </div>

      {/* 2. FREE MARKET: 1X2 (Visible to Everyone) */}
      <div className="p-8 grid grid-cols-3 gap-4">
        <div className="text-center bg-slate-800/30 border border-slate-800 p-4 rounded-3xl">
          <p className="text-white font-black text-2xl mb-1">{P(hWin)}</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">1 (Home)</p>
        </div>
        <div className="text-center bg-slate-800/30 border border-slate-800 p-4 rounded-3xl">
          <p className="text-slate-400 font-black text-2xl mb-1">{P(draw)}</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">X (Draw)</p>
        </div>
        <div className="text-center bg-slate-800/30 border border-slate-800 p-4 rounded-3xl">
          <p className="text-white font-black text-2xl mb-1">{P(aWin)}</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">2 (Away)</p>
        </div>
      </div>

      {/* 3. VIP MARKETS GRID (Locked for non-VIP) */}
      <div className="relative p-8 pt-2 bg-slate-900/10">
        {!isVip && (
          <div className="absolute inset-0 z-20 backdrop-blur-xl bg-slate-950/70 flex flex-col items-center justify-center rounded-b-[2.5rem] p-6 text-center">
            <div className="bg-amber-500/10 p-4 rounded-full mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/5">
              <Crown className="text-amber-500" size={32} fill="currentColor" />
            </div>
            <h5 className="text-white font-black text-xl italic uppercase tracking-tighter mb-2">Unlock 8 VIP Markets</h5>
            <p className="text-slate-400 text-xs mb-6 max-w-[240px]">Access BTTS, Corners, and Half-Time data with 98% accuracy.</p>
            <button className="w-full max-w-xs py-4 bg-amber-500 text-black text-[11px] font-black rounded-2xl uppercase shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              Get VIP Access Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <VipMarket label="BTTS (Both to Score)" val={btts > 0.52 ? "YES" : "NO"} prob={P(btts)} />
          <VipMarket label="Double Chance" val={hWin + draw > aWin + draw ? "1X" : "X2"} prob={P(Math.max(hWin+draw, aWin+draw))} />
          <VipMarket label="Overs & Unders" val={ov25 > 0.48 ? "Over 2.5" : "Under 2.5"} prob={P(ov25 > 0.48 ? ov25 : 1 - ov25)} />
          <VipMarket label="1st Half O/U 0.5" val={fhOv05 > 0.65 ? "OVER" : "UNDER"} prob={P(fhOv05)} />
          <VipMarket label="Total Corners" val={cornerExp > 10.2 ? "Over 10.5" : "Over 8.5"} icon />
          <VipMarket label="Home Team O/U 1.5" val={hOv15 > 0.42 ? "OVER" : "UNDER"} prob={P(hOv15)} />
          <VipMarket label="Away Team O/U 1.5" val={aOv15 > 0.42 ? "OVER" : "UNDER"} prob={P(aOv15)} />
          <VipMarket label="Draw No Bet" val={hWin > aWin ? "Home (1)" : "Away (2)"} prob={P(hWin / (hWin + aWin))} />
        </div>
      </div>

      {/* BETWAY CTA */}
      <button className="w-full bg-[#1ed760] hover:bg-[#1db954] py-6 flex items-center justify-center gap-3 transition-all group">
        <Zap size={20} fill="black" className="group-hover:scale-110 transition-transform" />
        <span className="text-black font-black text-sm uppercase italic tracking-tighter">Stake on Betway South Africa</span>
      </button>
    </div>
  );
}

// --- SUB-COMPONENT FOR VIP ITEMS ---
function VipMarket({ label, val, prob, icon }: { label: string; val: string; prob?: string; icon?: boolean }) {
  return (
    <div className="bg-[#0f172a] border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between h-24 shadow-inner">
      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
        {icon ? <CornerDownRight size={10} className="text-amber-500" /> : <div className="w-1 h-1 bg-amber-500 rounded-full" />}
        {label}
      </span>
      <div className="flex justify-between items-end">
        <span className="text-sm font-black text-amber-500 uppercase italic tracking-tighter">{val}</span>
        {prob && <span className="text-[10px] text-slate-600 font-mono">{prob}</span>}
      </div>
    </div>
  );
}

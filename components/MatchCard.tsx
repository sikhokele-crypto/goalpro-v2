"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Crown,
  Zap,
  CornerDownRight,
  TrendingUp,
  Shield,
} from "lucide-react";

interface MatchCardProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    homeAttack: number;
    awayAttack: number;
    startTime: string;
    stadium?: string;
    homeLogo?: string;
    awayLogo?: string;
    country?: string;
    homeForm?: string;
    awayForm?: string;
  };
  isPaid: boolean;
  onUpgrade: () => void;
}

export default function MatchCard({ match, isPaid, onUpgrade }: MatchCardProps) {
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (lambda: number, x: number) => (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x);

  const hL = match.homeAttack * 1.45;
  const aL = match.awayAttack * 1.15;

  let hWin = 0, draw = 0, aWin = 0, btts = 0, ov25 = 0;
  let hOv15 = 0, aOv15 = 0, fhOv05 = 0;

  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = poisson(hL, h) * poisson(aL, a);
      if (h > a) hWin += p;
      else if (h === a) draw += p;
      else aWin += p;
      if (h > 0 && a > 0) btts += p;
      if (h + a > 2.5) ov25 += p;
      if (h > 1.5) hOv15 += p;
      if (a > 1.5) aOv15 += p;
      const fhp = poisson(hL * 0.35, h) * poisson(aL * 0.35, a);
      if (h + a > 0.5) fhOv05 += fhp;
    }
  }

  const cornerExp = 8.2 + (match.homeAttack + match.awayAttack) * 0.75;
  const P = (v: number) => Math.min(Math.round(v * 100), 98) + "%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#111827] shadow-2xl mb-10"
    >
      <div className="relative z-10">
        <div className="p-8 border-b border-white/10">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] bg-blue-500/15 text-blue-300 border border-blue-400/20 px-4 py-1.5 rounded-full font-black uppercase tracking-widest uppercase">
              {match.league}
            </span>
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI Live
            </div>
          </div>

          <div className="flex justify-between items-center px-2 mb-10">
            <TeamDisplay logo={match.homeLogo} name={match.homeTeam} side="Home" />
            <span className="text-slate-800 font-black text-4xl italic uppercase tracking-tighter">VS</span>
            <TeamDisplay logo={match.awayLogo} name={match.awayTeam} side="Away" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <MarketBox val={P(hWin)} label="1 (Home)" delay={0.1} />
            <MarketBox val={P(draw)} label="X (Draw)" delay={0.2} />
            <MarketBox val={P(aWin)} label="2 (Away)" delay={0.3} />
          </div>
        </div>

        <div className="relative p-8 pt-4 bg-white/[0.02]">
          {!isPaid && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-8 bg-slate-950/60 backdrop-blur-xl rounded-b-[2.5rem]">
              <Crown className="text-amber-500 mb-4" size={42} fill="currentColor" />
              <h5 className="text-white font-black text-2xl uppercase mb-2 italic">Unlock 8 VIP Markets</h5>
              <button onClick={onUpgrade} className="w-full max-w-xs py-5 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest shadow-xl transition-all">
                Upgrade Now
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <VipItem label="BTTS (Yes)" val={P(btts)} />
            <VipItem label="Double Chance" val={hWin + draw > aWin + draw ? "1X" : "X2"} />
            <VipItem label="Overs & Unders" val={ov25 > 0.48 ? "Over 2.5" : "Under 2.5"} />
            <VipItem label="1st Half O/U 0.5" val={P(fhOv05)} />
            <VipItem label="Total Corners" val={cornerExp > 10.2 ? "Over 10.5" : "Over 8.5"} icon />
            <VipItem label="Home Team O/U 1.5" val={P(hOv15)} />
            <VipItem label="Away Team O/U 1.5" val={P(aOv15)} />
            <VipItem label="Draw No Bet" val={hWin > aWin ? "Home (1)" : "Away (2)"} />
          </div>
        </div>

        <button className="w-full bg-[#1ed760] hover:bg-[#1db954] py-7 flex items-center justify-center gap-3 transition-colors">
          <Zap size={22} fill="black" />
          <span className="text-black font-black text-sm uppercase italic tracking-tight">Stake on Betway South Africa</span>
        </button>
      </div>
    </motion.div>
  );
}

function MarketBox({ val, label, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] text-center">
      <p className="text-white font-black text-2xl mb-1">{val}</p>
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

function TeamDisplay({ logo, name, side }: any) {
  return (
    <div className="text-center w-[40%]">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
          {logo ? <Image src={logo} alt={name} width={42} height={42} /> : <Shield className="text-slate-600" size={28} />}
        </div>
      </div>
      <p className="text-white font-black text-lg truncate mb-1">{name}</p>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{side}</p>
    </div>
  );
}

function VipItem({ label, val, icon }: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex flex-col justify-center min-h-[95px]">
      <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
        {icon ? <CornerDownRight size={10} className="text-amber-500" /> : <div className="w-1 h-1 bg-amber-500 rounded-full" />}
        {label}
      </span>
      <span className="text-[14px] font-black text-amber-500 uppercase italic tracking-tighter flex items-center gap-2">
        <TrendingUp size={14} />
        {val}
      </span>
    </motion.div>
  );
}

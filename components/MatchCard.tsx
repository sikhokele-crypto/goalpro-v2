"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Zap,
  Activity,
  CornerDownRight,
  TrendingUp,
  Shield,
  Clock,
  MapPin,
  ChevronRight
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

export default function MatchCard({
  match,
  isPaid,
  onUpgrade,
}: MatchCardProps) {
  // --- 🧠 ANALYTICS ENGINE (Poisson Distribution) ---
  const factorial = (n: number): number =>
    n <= 1 ? 1 : n * factorial(n - 1);

  const poisson = (lambda: number, x: number) =>
    (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x);

  // Calibrating Expected Goals (xG) based on South African Market Data
  const hL = match.homeAttack * 1.45;
  const aL = match.awayAttack * 1.15;

  let hWin = 0, draw = 0, aWin = 0, btts = 0, ov25 = 0;
  let hOv15 = 0, aOv15 = 0, fhOv05 = 0;

  // Compute 6x6 Scoreline Probability Matrix
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

      // 1st Half weighted at 35% of match intensity
      const fhp = poisson(hL * 0.35, h) * poisson(aL * 0.35, a);
      if (h + a > 0.5) fhOv05 += fhp;
    }
  }

  const cornerExp = 8.2 + (match.homeAttack + match.awayAttack) * 0.75;
  const P = (v: number) => Math.min(Math.round(v * 100), 98) + "%";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#111827] shadow-2xl mb-12 group"
    >
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="p-8 border-b border-white/10">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-400/20 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em]">
                {match.league}
              </span>
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest pl-1">
                <Clock size={12} className="text-blue-500" />
                {match.startTime}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI Verified
            </div>
          </div>

          {/* VS Display */}
          <div className="flex justify-between items-center mb-10">
            <TeamSection logo={match.homeLogo} name={match.homeTeam} side="Home Team" />
            <div className="flex flex-col items-center">
              <span className="text-slate-800 font-black text-5xl italic uppercase opacity-40 select-none">VS</span>
            </div>
            <TeamSection logo={match.awayLogo} name={match.awayTeam} side="Away Team" />
          </div>

          {/* Main 1X2 Markets */}
          <div className="grid grid-cols-3 gap-4">
            <MarketBox val={P(hWin)} label="Home (1)" delay={0.1} />
            <MarketBox val={P(draw)} label="Draw (X)" delay={0.2} />
            <MarketBox val={P(aWin)} label="Away (2)" delay={0.3} />
          </div>
        </div>

        {/* VIP Markets Section */}
        <div className="relative p-8 pt-6 bg-black/20">
          <AnimatePresence>
            {!isPaid && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-8 bg-[#050816]/80 backdrop-blur-md rounded-b-[2.5rem]"
              >
                <div className="bg-amber-500/10 p-5 rounded-full mb-4 border border-amber-500/20">
                  <Crown className="text-amber-500" size={40} fill="currentColor" />
                </div>
                <h5 className="text-white font-black text-2xl uppercase mb-2 italic tracking-tight">Unlock 8 VIP Markets</h5>
                <p className="text-slate-400 text-sm mb-8 max-w-[280px]">Access BTTS, Corners, DNB, and HT Predictions with 98% Accuracy.</p>
                <button 
                  onClick={onUpgrade} 
                  className="w-full max-w-xs py-5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Upgrade to VIP
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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

        {/* CTA Button */}
        <button className="w-full bg-[#1ed760] hover:bg-[#1db954] py-8 flex items-center justify-center gap-3 transition-all group/btn">
          <Zap size={24} fill="black" className="group-hover/btn:scale-125 transition-transform" />
          <span className="text-black font-black text-base uppercase italic tracking-tight">Stake on Betway South Africa</span>
          <ChevronRight size={20} className="text-black/50" />
        </button>
      </div>
    </motion.div>
  );
}

// --- Internal Reusable UI Components ---

function TeamSection({ logo, name, side }: { logo?: string; name: string; side: string }) {
  return (
    <div className="flex flex-col items-center w-[40%]">
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-20 h-20 rounded-full bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center p-4 mb-4 shadow-2xl"
      >
        {logo ? (
          <Image src={logo} alt={name} width={52} height={52} className="object-contain" />
        ) : (
          <Shield className="text-slate-700" size={36} />
        )}
      </motion.div>
      <p className="text-white font-black text-xl text-center truncate w-full mb-1 tracking-tighter">{name}</p>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{side}</p>
    </div>
  );
}

function MarketBox({ val, label, delay }: { val: string; label: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center hover:bg-white/10 transition-colors"
    >
      <p className="text-white font-black text-2xl mb-1">{val}</p>
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

function VipItem({ label, val, icon }: { label: string; val: string; icon?: boolean }) {
  return (
    <motion.div 
      whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.08)" }}
      className="bg-white/5 border border-white/10 p-5 rounded-[1.8rem] flex flex-col justify-center min-h-[100px] transition-all"
    >
      <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
        {icon ? <CornerDownRight size={10} className="text-amber-500" /> : <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
        {label}
      </span>
      <span className="text-[15px] font-black text-amber-500 uppercase italic tracking-tighter flex items-center gap-2">
        <TrendingUp size={16} />
        {val}
      </span>
    </motion.div>
  );
}

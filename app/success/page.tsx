"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
      <div className="bg-slate-900/50 border border-emerald-500/20 p-10 rounded-[3rem] max-w-sm shadow-2xl shadow-emerald-500/5">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">VIP ACTIVE</h1>
        <p className="text-slate-400 text-sm font-bold mb-8 uppercase tracking-widest">Your IQ Markets are now unlocked</p>
        
        <Link href="/" className="block w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
          Back to Analysis
        </Link>
      </div>
    </main>
  );
}

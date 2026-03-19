"use client";

export default function GoalPro() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-6 font-sans flex flex-col items-center">
      {/* Brand Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-10 border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-black italic text-blue-500 tracking-tighter">GOALPRO</h1>
        <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">
          Free Predictions
        </div>
      </div>

      {/* Match Card */}
      <div className="w-full max-w-md bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl">
        <div className="flex justify-between text-[10px] text-slate-500 mb-4 font-bold uppercase tracking-widest">
          <span>Premier League</span>
          <span>20:45</span>
        </div>
        
        <div className="flex justify-between items-center mb-8 px-2 text-center">
          <span className="text-xl font-bold flex-1 text-left">Arsenal</span>
          <span className="text-slate-700 font-black px-3 text-sm">VS</span>
          <span className="text-xl font-bold flex-1 text-right">Liverpool</span>
        </div>

        {/* Markets Grid - All Unlocked */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
            <p className="text-[9px] text-slate-500 uppercase mb-1 font-bold">Result</p>
            <p className="text-blue-400 font-black text-sm">Home Win</p>
          </div>
          
          <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
            <p className="text-[9px] text-slate-500 uppercase mb-1 font-bold">Corners</p>
            <p className="text-emerald-400 font-black text-sm">Over 10.5</p>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
            <p className="text-[9px] text-slate-500 uppercase mb-1 font-bold">BTTS</p>
            <p className="text-emerald-400 font-black text-sm">Yes</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
          <p className="text-slate-400 text-[11px] font-medium italic">
            "High probability banker tips updated daily."
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-slate-600 font-medium tracking-widest uppercase">
        GoalPro Analysis 2026
      </p>
    </main>
  );
}
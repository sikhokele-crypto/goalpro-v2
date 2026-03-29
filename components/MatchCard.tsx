"use client";

export default function MatchCard({ match, isVIP }: any) {

  // 🧠 AI Prediction Engine (Improved)
  const predict = () => {
    const { home, away } = match.odds || {};
    if (!home || !away) return "N/A";

    const probHome = 1 / home;
    const probAway = 1 / away;

    return probHome > probAway ? "HOME WIN" : "AWAY WIN";
  };

  const percent = (odd: number) => {
    if (!odd) return "-";
    return Math.round((1 / odd) * 100) + "%";
  };

  return (
    <div className="bg-gradient-to-br from-[#050816] to-[#111827] p-6 rounded-2xl border border-white/10 hover:border-blue-500 transition">

      {/* League */}
      <p className="text-xs text-blue-400 mb-2">{match.league}</p>

      {/* Teams */}
      <div className="flex justify-between mb-4 font-bold">
        <span>{match.homeTeam}</span>
        <span className="text-slate-500">VS</span>
        <span>{match.awayTeam}</span>
      </div>

      {/* Odds */}
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <OddBox label="1" value={match.odds?.home} percent={percent(match.odds?.home)} />
        <OddBox label="X" value={match.odds?.draw} percent={percent(match.odds?.draw)} />
        <OddBox label="2" value={match.odds?.away} percent={percent(match.odds?.away)} />
      </div>

      {/* AI */}
      <div className="bg-black/40 p-3 rounded-xl text-center mb-3">
        <p className="text-xs text-slate-400">AI Prediction</p>
        <p className="text-green-400 font-bold">{predict()}</p>
      </div>

      {/* VIP */}
      {!isVIP ? (
        <div className="text-center text-yellow-400 text-sm">
          🔒 Unlock VIP Markets
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-500/10 p-2 rounded">BTTS: YES</div>
          <div className="bg-green-500/10 p-2 rounded">Over 2.5</div>
          <div className="bg-green-500/10 p-2 rounded">Corners: 9+</div>
          <div className="bg-green-500/10 p-2 rounded">Safe Bet</div>
        </div>
      )}

    </div>
  );
}

function OddBox({ label, value, percent }: any) {
  return (
    <div className="bg-[#1f2937] p-3 rounded-lg">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-green-400 font-bold">{value || "-"}</p>
      <p className="text-[10px] text-slate-500">{percent}</p>
    </div>
  );
}

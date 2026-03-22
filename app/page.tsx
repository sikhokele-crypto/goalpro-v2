"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = "a14dbd219f66d6191e6df8757a94771c";

const MARKETS = [
  "1X2",
  "BTTS",
  "Overs_Unders",
  "Double_Chance",
  "Total_Corners",
  "Bookings",
];

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const date = new Date().toISOString().split("T")[0];

        const res = await axios.get(
          "https://v3.football.api-sports.io/fixtures",
          {
            params: { date },
            headers: { "x-apisports-key": API_KEY },
          }
        );

        setFixtures((res.data.response || []).slice(0, 20));
      } catch (e) {
        console.log("error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= SAFE PREDICTIONS =================
  const getPrediction = (item: any) => {
    const h = item.teams.home.id % 50;
    const a = item.teams.away.id % 50;

    const homeProb = 40 + (h % 30);
    const awayProb = 40 + (a % 30);
    const drawProb = 100 - (homeProb + awayProb > 90 ? 90 : homeProb + awayProb);

    return { homeProb, drawProb, awayProb };
  };

  const getMarket = (item: any, market: string) => {
    const p = getPrediction(item);

    switch (market) {
      case "1X2":
        return `H:${p.homeProb}% D:${p.drawProb}% A:${p.awayProb}%`;
      case "BTTS":
        return p.homeProb > 45 && p.awayProb > 40 ? "YES" : "NO";
      case "Overs_Unders":
        return p.homeProb + p.awayProb > 75 ? "OVER 2.5" : "UNDER 2.5";
      case "Double_Chance":
        return p.homeProb > p.awayProb ? "1X" : "X2";
      case "Total_Corners":
        return p.homeProb + p.awayProb > 70 ? "OVER 8.5" : "UNDER 8.5";
      case "Bookings":
        return p.homeProb + p.awayProb > 65 ? "OVER 3.5" : "UNDER 3.5";
      default:
        return "--";
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 max-w-xl mx-auto">

      {/* HEADER */}
      <header className="sticky top-0 bg-[#020617] pb-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-black text-blue-500 italic">
            GOALPRO
          </h1>

          <button
            onClick={() => setIsPaid(true)}
            className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold"
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>

        <input
          placeholder="Search Live Fixtures..."
          className="w-full bg-[#0f172a] p-3 rounded-xl text-sm"
        />
      </header>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center mt-20 animate-pulse">
          Loading Matches...
        </p>
      ) : fixtures.length === 0 ? (
        <p className="text-center mt-20 text-slate-400">
          No matches found.
        </p>
      ) : (
        fixtures.map((item) => (
          <div
            key={item.fixture.id}
            className="bg-[#0f172a] p-6 rounded-[2rem] mb-6"
          >
            {/* LEAGUE */}
            <div className="flex justify-between text-xs mb-4 text-slate-400">
              <span>{item.league.name}</span>
              <span>
                {new Date(item.fixture.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* TEAMS */}
            <div className="flex justify-between text-lg font-bold mb-6 uppercase">
              <span>{item.teams.home.name}</span>
              <span className="opacity-40">VS</span>
              <span>{item.teams.away.name}</span>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() =>
                  setSelectedMatch(
                    selectedMatch === item.fixture.id
                      ? null
                      : item.fixture.id
                  )
                }
                className="bg-blue-600/20 border border-blue-500/30 py-3 rounded-xl text-xs"
              >
                {selectedMatch === item.fixture.id
                  ? "Close Stats ▲"
                  : "View Analysis ▼"}
              </button>

              <button className="bg-emerald-600/20 border border-emerald-500/30 py-3 rounded-xl text-xs text-emerald-400">
                Betway
              </button>
            </div>

            {/* MARKETS */}
            {selectedMatch === item.fixture.id && (
              <div className="grid grid-cols-2 gap-3">
                {MARKETS.map((m) => (
                  <div
                    key={m}
                    className="p-4 bg-[#020617] rounded-xl relative"
                    onClick={() => !isPaid && setIsPaid(false)}
                  >
                    <p className="text-[10px] text-slate-400 mb-1 uppercase">
                      {m.replace("_", " ")}
                    </p>

                    <p
                      className={`font-bold ${
                        isPaid ? "text-blue-400" : "blur-sm opacity-30"
                      }`}
                    >
                      {isPaid ? getMarket(item, m) : "LOCKED"}
                    </p>

                    {!isPaid && (
                      <span className="absolute top-2 right-2 text-[8px] bg-blue-600 px-2 py-1 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </main>
  );
}

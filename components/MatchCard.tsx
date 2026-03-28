"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Script from "next/script";

const API_KEY = "3";
const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "pub-4608500942276282";
const BETWAY_AFFILIATE_URL = "https://www.betway.co.za";

const POPULAR_LEAGUES = [4328, 4335, 4331, 4332, 4334, 4356];

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) =>
    (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item.teams.home.id;
    const aId = item.teams.away.id;
    const isPopular = POPULAR_LEAGUES.includes(item.league.id);

    const homeLambda = (hId % 10) / 4 + (isPopular ? 1.8 : 1.2);
    const awayLambda = (aId % 10) / 5 + (isPopular ? 1.4 : 0.8);

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

    return {
      homeProb: Math.floor((hWin / total) * 100),
      drawProb: Math.floor((draw / total) * 100),
      awayProb: Math.floor((aWin / total) * 100),
      homeLambda,
      awayLambda,
    };
  };

  const getAutoPick = (probs: any) => {
    const max = Math.max(probs.homeProb, probs.drawProb, probs.awayProb);
    if (probs.homeProb === max) return "HOME WIN";
    if (probs.awayProb === max) return "AWAY WIN";
    return "DRAW / X";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsnextleague.php?id=4328`);
        const events = res.data.events || [];

        const mapped = events.map((event: any) => ({
          fixture: { id: parseInt(event.idEvent) },
          league: { id: parseInt(event.idLeague), name: event.strLeague },
          teams: {
            home: { id: parseInt(event.idHomeTeam), name: event.strHomeTeam },
            away: { id: parseInt(event.idAwayTeam), name: event.strAwayTeam }
          }
        }));

        setFixtures(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
      BTTS: probs.homeLambda > 1.6 && probs.awayLambda > 1.3 ? "Yes" : "No",
      Overs_Unders: probs.homeLambda + probs.awayLambda > 2.6 ? "Over 2.5" : "Under 2.5",
      Double_Chance: probs.homeProb > probs.awayProb ? "1X" : "X2",
      Handicap: probs.homeProb > 55 ? "-1.0" : "+1.5",
      Clean_Sheet: probs.awayLambda < 1.1 ? "Home Yes" : "No",
      First_Half: probs.homeProb > 42 ? "Home" : "Draw",
      Home_Overs: `Over ${probs.homeLambda > 1.9 ? "1.5" : "0.5"}`,
      Total_Corners: `Over ${(item.teams.home.id % 4) + 7.5}`,
    };
    return markets[market] || "90% IQ";
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 max-w-xl mx-auto pb-32">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl pt-4 pb-6 border-b border-white/5 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-4xl font-black italic text-[#00d4ff] drop-shadow-[0_0_20px_rgba(0,212,255,0.7)]">
            GOALPRO
          </h1>

          <button
            onClick={() => !isPaid && setShowPaymentModal(true)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest
            ${isPaid ? "bg-emerald-500" : "bg-[#21439c]"}`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search matches..."
          className="w-full bg-transparent border-b border-white/10 py-4 text-sm text-white/60"
        />
      </header>

      {/* MATCHES */}
      <div className="space-y-10">
        {loading ? (
          <p className="text-center text-[#00d4ff] animate-pulse py-20">
            Loading predictions...
          </p>
        ) : (
          fixtures.map((item) => {
            const probs = getPoissonPredictions(item);
            const pick = getAutoPick(probs);

            return (
              <div key={item.fixture.id} className="bg-gradient-to-b from-[#182235] to-[#0f1624] rounded-[32px] p-6 border border-white/5 shadow-xl">

                <div className="flex justify-between text-[10px] mb-4 uppercase">
                  <span className="text-[#4e638c]">{item.league.name}</span>
                  <span className="text-[#00ffa3]">PICK: {pick}</span>
                </div>

                <div className="flex justify-between mb-6">
                  <h2>{item.teams.home.name}</h2>
                  <span>VS</span>
                  <h2>{item.teams.away.name}</h2>
                </div>

                <div className="h-2 flex rounded-full overflow-hidden bg-white/5 mb-4">
                  <div style={{ width: `${probs.homeProb}%` }} className="bg-[#00d4ff]" />
                  <div style={{ width: `${probs.drawProb}%` }} className="bg-white/20" />
                  <div style={{ width: `${probs.awayProb}%` }} className="bg-[#00ffa3]" />
                </div>

                <div className="flex justify-between text-xs mb-4">
                  <span>Home {probs.homeProb}%</span>
                  <span>Draw {probs.drawProb}%</span>
                  <span>Away {probs.awayProb}%</span>
                </div>

                <a href={BETWAY_AFFILIATE_URL} target="_blank" className="block text-center bg-blue-500 py-3 rounded-xl mb-4">
                  Bet on Betway
                </a>

              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

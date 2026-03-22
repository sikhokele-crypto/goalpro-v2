"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = '123'; // TheSportsDB key
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za';

const POPULAR_LEAGUES = [39, 140, 2, 135, 78];

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

    // Disable popularity logic (IDs no longer match)
    const isPopular = false;

    const homeLambda = ((hId % 10) / 4) + (isPopular ? 1.8 : 1.2);
    const awayLambda = ((aId % 10) / 5) + (isPopular ? 1.4 : 0.8);

    let hWin = 0, draw = 0, aWin = 0;

    for (let h = 0; h < 6; h++) {
      for (let a = 0; a < 6; a++) {
        const prob = poisson(homeLambda, h) * poisson(awayLambda, a);
        if (h > a) hWin += prob;
        else if (h === a) draw += prob;
        else aWin += prob;
      }
    }

    const total = hWin + draw + aWin;

    return {
      homeProb: Math.floor((hWin / total) * 100),
      drawProb: Math.floor((draw / total) * 100),
      awayProb: Math.floor((aWin / total) * 100),
      homeLambda,
      awayLambda
    };
  };

  const getAutoPick = (probs: any) => {
    const { homeProb, drawProb, awayProb } = probs;
    const max = Math.max(homeProb, drawProb, awayProb);

    if (homeProb === max) return "HOME WIN";
    if (awayProb === max) return "AWAY WIN";
    return "DRAW / X";
  };

  // ✅ UPDATED FETCH (TheSportsDB)
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);

        const today = new Date().toISOString().split('T')[0];

        const res = await axios.get(
          `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php`,
          {
            params: { d: today, s: "Soccer" }
          }
        );

        const events = res.data.events || [];

        const mappedMatches = events.map((event: any) => ({
          fixture: {
            id: parseInt(event.idEvent),
            date: event.dateEvent + "T" + (event.strTime || "00:00:00"),
            status: { short: "NS" }
          },
          league: {
            id: parseInt(event.idLeague),
            name: event.strLeague
          },
          teams: {
            home: {
              id: parseInt(event.idHomeTeam),
              name: event.strHomeTeam
            },
            away: {
              id: parseInt(event.idAwayTeam),
              name: event.strAwayTeam
            }
          }
        }));

        setFixtures(mappedMatches);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
  }, []);

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
      "BTTS": (probs.homeLambda > 1.6 && probs.awayLambda > 1.3) ? "Yes" : "No",
      "Overs_Unders": (probs.homeLambda + probs.awayLambda > 2.6) ? "Over 2.5" : "Under 2.5",
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw",
      "Home_Overs": `Over ${probs.homeLambda > 1.9 ? '1.5' : '0.5'}`,
      "Total_Corners": `Over ${(item.teams.home.id % 4) + 7.5}`,
    };
    return markets[market] || "90% IQ";
  };

  const AdSlot = () => {
    useEffect(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }, []);

    return (
      <div className="my-6 p-4 bg-blue-900/5 rounded-3xl border border-dashed border-slate-800 text-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={`ca-${PUB_ID}`}
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-32">
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8 px-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button
            onClick={() => !isPaid && setShowPaymentModal(true)}
            className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm"
        />
      </header>

      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-blue-500 py-20">Loading matches...</p>
        ) : (
          fixtures
            .filter((f: any) =>
              f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 50)
            .map((item: any, index: number) => {
              const probs = getPoissonPredictions(item);
              const autoPick = getAutoPick(probs);

              return (
                <div key={item.fixture.id} className="bg-[#0f172a] p-6 rounded-3xl">
                  <p className="text-xs text-slate-400">{item.league.name}</p>

                  <h2 className="text-lg font-bold text-center my-4">
                    {item.teams.home.name} vs {item.teams.away.name}
                  </h2>

                  <p className="text-center text-blue-400 text-sm">
                    Auto Pick: {autoPick}
                  </p>
                </div>
              );
            })
        )}
      </div>
    </main>
  );
}

"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = '123';
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za';

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
    const hId = item.teams.home.id || 1;
    const aId = item.teams.away.id || 1;

    const homeLambda = ((hId % 10) / 4) + 1.2;
    const awayLambda = ((aId % 10) / 5) + 0.8;

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
    const max = Math.max(probs.homeProb, probs.drawProb, probs.awayProb);
    if (probs.homeProb === max) return "HOME WIN";
    if (probs.awayProb === max) return "AWAY WIN";
    return "DRAW / X";
  };

  // ✅ THE SPORTS DB FETCH (FULLY COMPATIBLE)
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);

        const today = new Date().toISOString().split('T')[0];

        const res = await axios.get(
          `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php`,
          { params: { d: today, s: "Soccer" } }
        );

        const events = res.data.events || [];

        const mapped = events.map((event: any) => ({
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

        setFixtures(mapped);
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
      } catch {}
    }, []);

    return (
      <div className="my-6 p-4 text-center border border-dashed border-slate-800 rounded-3xl">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={`ca-${PUB_ID}`}
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-32">

      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} />

      <header className="sticky top-0 bg-[#020617]/95 pt-4 pb-6 mb-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>

          <button
            onClick={() => !isPaid && setShowPaymentModal(true)}
            className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-4 py-2 rounded-xl text-xs`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>

        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#0f172a]"
        />
      </header>

      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-blue-400">Loading...</p>
        ) : (
          fixtures
            .filter((f: any) =>
              f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item: any, i: number) => {
              const probs = getPoissonPredictions(item);
              const autoPick = getAutoPick(probs);

              return (
                <div key={item.fixture.id}>

                  {i % 5 === 0 && i !== 0 && <AdSlot />}

                  <div className="bg-[#0f172a] p-6 rounded-3xl">

                    <div className="text-xs text-slate-400 mb-2">
                      {item.league.name}
                    </div>

                    <div className="text-center font-bold mb-4">
                      {item.teams.home.name} vs {item.teams.away.name}
                    </div>

                    <div className="text-center text-blue-400 text-xs mb-4">
                      Auto Pick: {autoPick}
                    </div>

                    <button
                      onClick={() =>
                        setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)
                      }
                      className="w-full bg-blue-600/20 p-2 rounded-xl text-xs"
                    >
                      Toggle Markets
                    </button>

                    {selectedMatch === item.fixture.id && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {["BTTS","Overs_Unders","Double_Chance","Handicap"].map(m => (
                          <div
                            key={m}
                            onClick={() => !isPaid && setShowPaymentModal(true)}
                            className="p-3 bg-black/20 rounded-xl"
                          >
                            <p className="text-[10px]">{m}</p>
                            <p className={!isPaid ? "blur-sm" : "text-blue-400"}>
                              {isPaid ? getEliteMarket(item, m, probs) : "LOCKED"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* PAYPAL MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="bg-[#0f172a] p-6 rounded-3xl text-center">
            <h2 className="text-xl mb-4">Unlock VIP</h2>

            <Script
              src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`}
              onLoad={() => {
                // @ts-ignore
                window.paypal?.Buttons({
                  createOrder: (data, actions) =>
                    actions.order.create({
                      purchase_units: [{ amount: { value: "1.00" } }]
                    }),
                  onApprove: (data, actions) =>
                    actions.order.capture().then(() => {
                      setIsPaid(true);
                      setShowPaymentModal(false);
                    })
                }).render('#paypal');
              }}
            />

            <div id="paypal" />

            <button onClick={() => setShowPaymentModal(false)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

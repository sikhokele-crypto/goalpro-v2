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

  // Persistence for VIP status
  useEffect(() => {
    const status = localStorage.getItem('goalpro_vip');
    if (status === 'true') setIsPaid(true);
  }, []);

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
    return markets[market] || "N/A";
  };

  const AdSlot = () => {
    useEffect(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }, []);

    return (
      <div className="my-6 p-4 text-center border border-dashed border-slate-800 rounded-3xl overflow-hidden">
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
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossorigin="anonymous" />

      <header className="sticky top-0 bg-[#020617]/95 pt-4 pb-6 mb-8 z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <button
            onClick={() => !isPaid && setShowPaymentModal(true)}
            className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all active:scale-95`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>

        <input
          placeholder="Search team or league..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-2xl bg-[#0f172a] border border-slate-800 focus:outline-none focus:border-blue-500 text-sm"
        />
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 font-mono text-sm">ANALYZING FIXTURES...</p>
          </div>
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
                  {i % 4 === 0 && i !== 0 && <AdSlot />}

                  <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800/50 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                            {item.league.name}
                        </span>
                        <span className="text-[10px] text-slate-500">Live IQ Engine</span>
                    </div>

                    <div className="grid grid-cols-3 items-center text-center gap-2 mb-6">
                        <div className="text-sm font-bold">{item.teams.home.name}</div>
                        <div className="text-xs text-slate-500 font-mono italic">VS</div>
                        <div className="text-sm font-bold">{item.teams.away.name}</div>
                    </div>

                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-4 flex justify-between items-center">
                        <div className="text-[10px] font-bold text-blue-400">PRO PICK</div>
                        <div className="text-sm font-black text-white">{autoPick}</div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)
                      }
                      className="w-full bg-slate-800/50 hover:bg-slate-800 p-3 rounded-xl text-[10px] font-bold transition-colors"
                    >
                      {selectedMatch === item.fixture.id ? "HIDE MARKETS" : "VIEW ELITE MARKETS"}
                    </button>

                    {selectedMatch === item.fixture.id && (
                      <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                        {["BTTS","Overs_Unders","Double_Chance","Handicap","Clean_Sheet","First_Half","Home_Overs","Total_Corners"].map(m => (
                          <div
                            key={m}
                            onClick={() => !isPaid && setShowPaymentModal(true)}
                            className="p-3 bg-black/40 rounded-2xl border border-slate-800/50 cursor-pointer hover:border-blue-500/30"
                          >
                            <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">{m.replace('_', ' ')}</p>
                            <p className={`text-xs font-bold ${!isPaid ? "blur-sm" : "text-blue-400"}`}>
                              {isPaid ? getEliteMarket(item, m, probs) : "LOCKED"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <a 
                        href={BETWAY_AFFILIATE_URL}
                        target="_blank"
                        className="block text-center mt-4 text-[9px] text-slate-600 underline"
                    >
                        Bet on this match at Betway →
                    </a>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* FOOTER NAV */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-blue-600 p-4 rounded-3xl flex justify-around items-center shadow-2xl z-50">
        <button className="text-white font-black text-xs">FIXTURES</button>
        <div className="h-4 w-px bg-white/20"></div>
        <button onClick={() => setShowPaymentModal(true)} className="text-white/70 font-black text-xs">VIP TIPS</button>
        <div className="h-4 w-px bg-white/20"></div>
        <Link href={BETWAY_AFFILIATE_URL} className="text-white/70 font-black text-xs underline">BETWAY</Link>
      </nav>

      {/* PAYPAL MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-[100] backdrop-blur-sm">
          <div className="bg-[#0f172a] p-8 rounded-[3rem] text-center border border-blue-500/30 max-w-sm w-full">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">ELITE ACCESS</h2>
            <p className="text-slate-400 text-xs mb-8">Unlock 8+ extra markets per match, including Corners, BTTS, and Handicaps.</p>

            <div id="paypal" className="mb-6" />

            <Script
              src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`}
              onLoad={() => {
                // @ts-ignore
                if (window.paypal && !document.getElementById('paypal').hasChildNodes()) {
                    // @ts-ignore
                    window.paypal.Buttons({
                        style: { shape: 'pill', color: 'blue', label: 'pay' },
                        createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: "1.00" } }] }),
                        onApprove: (data, actions) => actions.order.capture().then(() => {
                            setIsPaid(true);
                            localStorage.setItem('goalpro_vip', 'true');
                            setShowPaymentModal(false);
                        })
                    }).render('#paypal');
                }
              }}
            />

            <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-500 text-[10px] font-bold uppercase tracking-widest"
            >
                Maybe Later
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

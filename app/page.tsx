"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Script from "next/script";

const TSDB_API_KEY = "3"; 
const TSDB_BASE_URL = "https://www.thesportsdb.com/api/v1/json";
const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "pub-4608500942276282";
const BETWAY_AFFILIATE_URL = "https://www.betway.co.za";

// Popular League IDs from TheSportsDB
const POPULAR_LEAGUES = [4328, 4335, 4331, 4332, 4334, 4356, 4406, 4344];

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
      homeLambda, awayLambda,
    };
  };

  // ✅ NEW FETCH LOGIC: Fetches all leagues for the current day
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Using 'eventsday.php' as seen in your V1 Docs screenshot
      const res = await axios.get(`${TSDB_BASE_URL}/${TSDB_API_KEY}/eventsday.php?d=${today}&s=Soccer`);
      const events = res.data.events || [];
      
      const mapped = events.map((event: any) => ({
        fixture: { id: parseInt(event.idEvent) },
        league: { id: parseInt(event.idLeague), name: event.strLeague },
        teams: {
          home: { id: parseInt(event.idHomeTeam), name: event.strHomeTeam },
          away: { id: parseInt(event.idAwayTeam), name: event.strAwayTeam }
        }
      }));

      // Sort so popular leagues appear first
      const sorted = mapped.sort((a: any, b: any) => {
        const aPop = POPULAR_LEAGUES.includes(a.league.id) ? 1 : 0;
        const bPop = POPULAR_LEAGUES.includes(b.league.id) ? 1 : 0;
        return bPop - aPop;
      });

      setFixtures(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} strategy="afterInteractive" crossOrigin="anonymous" />
      <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} strategy="beforeInteractive" />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`px-5 py-2 rounded-2xl text-[10px] font-black ${isPaid ? "bg-emerald-600" : "bg-blue-600"}`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search team or league..." className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-sm" />
      </header>

      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-blue-500 animate-pulse py-20">Syncing Multi-League Data...</p>
        ) : (
          fixtures.filter(f => 
            f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 60).map((item, index) => {
            const probs = getPoissonPredictions(item);
            const isPopular = POPULAR_LEAGUES.includes(item.league.id);

            return (
              <div key={item.fixture.id}>
                <div className={`bg-[#0f172a] p-6 rounded-3xl border ${isPopular ? "border-blue-500 shadow-lg shadow-blue-500/10" : "border-slate-800"}`}>
                  <div className="text-[10px] mb-3 font-bold text-slate-400 flex justify-between uppercase tracking-widest">
                    <span>{item.league.name}</span>
                    <span className="text-blue-400">PICK: {probs.homeProb > probs.awayProb ? "HOME" : "AWAY"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mb-6 uppercase">
                    <span className="text-center flex-1">{item.teams.home.name}</span>
                    <span className="px-3 opacity-30 italic text-sm">vs</span>
                    <span className="text-center flex-1">{item.teams.away.name}</span>
                  </div>
                  <div className="h-1.5 flex rounded-full overflow-hidden bg-slate-800 mb-6">
                    <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-500" />
                    <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-600" />
                    <div style={{ width: `${probs.awayProb}%` }} className="bg-emerald-500" />
                  </div>
                  <button onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)} className="w-full py-4 text-[10px] font-black bg-blue-600/10 border border-blue-500/20 rounded-2xl tracking-widest">
                    {selectedMatch === item.fixture.id ? "HIDE MARKETS" : "ELITE MARKETS"}
                  </button>
                  {selectedMatch === item.fixture.id && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {["BTTS", "Overs_Unders", "Double_Chance", "Handicap", "Clean_Sheet", "First_Half", "Home_Overs", "Total_Corners"].map((m) => (
                        <div key={m} className="p-3 bg-black/30 border border-slate-800 rounded-xl cursor-pointer" onClick={() => !isPaid && setShowPaymentModal(true)}>
                          <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">{m.replace('_', ' ')}</p>
                          <p className={`text-xs font-black ${isPaid ? "text-blue-400" : "blur-sm opacity-50"}`}>{isPaid ? getEliteMarket(item, m, probs) : "LOCKED"}</p>
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

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-center w-full max-w-sm border border-blue-500/30">
            <h2 className="text-2xl font-black mb-2 italic">UNLOCK VIP</h2>
            <div id="paypal-button-container" className="min-h-[150px] mt-4"></div>
            <PayPalButtonsRenderer setIsPaid={setIsPaid} setShowPaymentModal={setShowPaymentModal} />
            <button onClick={() => setShowPaymentModal(false)} className="mt-6 text-[10px] font-black text-slate-500 uppercase">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

function PayPalButtonsRenderer({ setIsPaid, setShowPaymentModal }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).paypal) {
        (window as any).paypal.Buttons({
          style: { layout: 'vertical', color: 'blue', shape: 'pill' },
          createOrder: (data: any, actions: any) => actions.order.create({ purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }] }),
          onApprove: (data: any, actions: any) => actions.order.capture().then(() => { setIsPaid(true); setShowPaymentModal(false); })
        }).render("#paypal-button-container");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [setIsPaid, setShowPaymentModal]);
  return null;
}

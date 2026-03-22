"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
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
  const poisson = (expected: number, actual: number) => (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item.teams.home.id;
    const aId = item.teams.away.id;
    const isPopular = POPULAR_LEAGUES.includes(item.league.id);
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
      homeLambda, awayLambda
    };
  };

  // ONLY CHANGE MADE HERE: Added isPaid check to restrict results to 1X2 for free users
  const getAutoPick = (probs: any) => {
    const { homeProb, drawProb, awayProb } = probs;
    if (!isPaid) return homeProb >= drawProb && homeProb >= awayProb ? "HOME WIN" : (awayProb >= drawProb ? "AWAY WIN" : "X (DRAW)");
    if (homeProb > 48) return "HOME WIN";
    if (awayProb > 48) return "AWAY WIN";
    if (drawProb > 32) return "X (DRAW)";
    return "OV 1.5 GOALS";
  };

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        if (now.getHours() >= 22) now.setDate(now.getDate() + 1);
        const targetDate = now.toISOString().split('T')[0];
        
        const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
          params: { date: targetDate },
          headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        });
        
        const allMatches = res.data.response || [];
        
        const sortedMatches = allMatches.sort((a: any, b: any) => {
          const aPop = POPULAR_LEAGUES.includes(a.league.id) ? 1 : 0;
          const bPop = POPULAR_LEAGUES.includes(b.league.id) ? 1 : 0;
          return bPop - aPop;
        }).filter((f: any) => f.fixture.status.short !== 'FT');

        setFixtures(sortedMatches);
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
      "Total_Corners": `Over ${(item.teams.home.id % 4) + 7.5}`,
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw",
      "Home_Overs": `Over ${probs.homeLambda > 1.9 ? '1.5' : '0.5'}`
    };
    return markets[market] || "90% IQ";
  };

  const AdSlot = () => {
    useEffect(() => {
      try { // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }, []);
    return (
      <div className="my-6 p-4 bg-blue-900/10 rounded-3xl border border-dashed border-blue-500/20 text-center">
        <p className="text-[7px] text-blue-500 font-black uppercase mb-2 tracking-widest">Sponsored Analysis</p>
        <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={`ca-${PUB_ID}`} data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" strategy="afterInteractive" />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input type="text" placeholder="Search Premier League..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none" />
      </header>

      <div className="space-y-8">
        {loading ? (
           <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20 tracking-widest">Syncing Popular Fixtures...</p>
        ) : (
          fixtures.filter((f: any) => 
            f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 50).map((item: any, index: number) => {
            const probs = getPoissonPredictions(item);
            const autoPick = getAutoPick(probs);
            const isPopular = POPULAR_LEAGUES.includes(item.league.id);

            return (
              <div key={item.fixture.id}>
                {index % 6 === 0 && <AdSlot />}
                <div className={`bg-[#0f172a] rounded-[2.5rem] border ${isPopular ? 'border-blue-500/40 shadow-blue-500/5' : 'border-slate-800/80'} p-6 shadow-2xl relative overflow-hidden`}>
                  <div className={`absolute top-0 right-10 ${isPopular ? 'bg-yellow-500' : 'bg-blue-600'} px-4 py-1.5 rounded-b-xl shadow-lg`}>
                    <p className={`text-[7px] font-black uppercase tracking-widest ${isPopular ? 'text-black' : 'text-white'}`}>Auto-Pick: {autoPick}</p>
                  </div>

                  <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase">
                    <span className={isPopular ? 'text-blue-400' : ''}>{isPopular && "⭐ "}{item.league.name}</span>
                    <span className="text-blue-400">{new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>

                  <div className="flex justify-between items-center mb-10 px-2 font-black text-xl text-white uppercase">
                    <span className="flex-1 text-center">{item.teams.home.name}</span>
                    <span className="px-4 opacity-10 text-[10px] italic">VS</span>
                    <span className="flex-1 text-center">{item.teams.away.name}</span>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between mb-2 text-[9px] font-black uppercase text-slate-500 px-1">
                      <span className={probs.homeProb > 40 ? "text-blue-400" : ""}>H {probs.homeProb}%</span>
                      <span>D {probs.drawProb}%</span>
                      <span className={probs.awayProb > 40 ? "text-emerald-400" : ""}>A {probs.awayProb}%</span>
                    </div>
                    <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-800">
                      <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-500"></div>
                      <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-600"></div>
                      <div style={{ width: `${probs.awayProb}%` }} className="bg-emerald-500"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)} className="py-4 text-[9px] font-black text-white uppercase bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                      {selectedMatch === item.fixture.id ? "Hide Markets ▲" : "Elite Predictions ▼"}
                    </button>
                    <a href={BETWAY_AFFILIATE_URL} target="_blank" className="py-4 text-[9px] font-black text-emerald-400 uppercase bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-center flex items-center justify-center">Betway</a>
                  </div>

                  {selectedMatch === item.fixture.id && (
                    <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-3">
                      {["BTTS", "Overs_Unders", "Double_Chance", "Handicap", "Clean_Sheet", "First_Half", "Home_Overs", "Total_Corners"].map((m) => (
                        <div key={m} onClick={() => !isPaid && setShowPaymentModal(true)} className="p-4 rounded-2xl border border-slate-800 bg-black/20 cursor-pointer">
                          <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{m.replace('_', ' ')}</p>
                          <div className="flex justify-between items-center">
                            <p className={`font-black text-xs ${!isPaid ? 'blur-md opacity-20' : 'text-blue-400'}`}>{isPaid ? getEliteMarket(item, m, probs) : "LOCKED"}</p>
                            {!isPaid && <span className="text-[6px] bg-blue-600 px-2 py-0.5 rounded-full font-black text-white">VIP</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-3xl font-black italic mb-2 tracking-tighter uppercase text-white">Unlock VIP</h2>
            <div id="paypal-container" className="my-8 min-h-[150px]">
              <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} onLoad={() => {
                // @ts-ignore
                if (window.paypal) {
                  window.paypal.Buttons({
                    style: { layout: 'vertical', color: 'blue', shape: 'pill' },
                    createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }] }),
                    onApprove: (data, actions) => actions.order.capture().then(() => { setIsPaid(true); setShowPaymentModal(false); })
                  }).render('#paypal-container');
                }
              }} />
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

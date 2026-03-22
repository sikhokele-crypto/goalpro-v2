"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Script from "next/script";

const API_KEY = "3";
const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "pub-4608500942276282";
const BETWAY_AFFILIATE_URL = "https://www.betway.co.za";

const LEAGUES = [
  { id: 0, name: "ALL" },
  { id: 4328, name: "EPL" },
  { id: 4335, name: "LA LIGA" },
  { id: 4331, name: "BUNDESLIGA" },
  { id: 4332, name: "SERIE A" },
  { id: 4334, name: "LIGUE 1" },
  { id: 4337, name: "EREDIVISIE" },
];

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLeague, setActiveLeague] = useState(0);
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
    const homeLambda = (hId % 10) / 4 + 1.5;
    const awayLambda = (aId % 10) / 5 + 1.1;

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

  // ✅ FIXED DATE HANDLING
  const formatLocalTime = (date: string, time: string) => {
    const d = new Date(`${date}T${time || "00:00:00"}Z`);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDayLabel = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "TODAY";
    if (d.toDateString() === tomorrow.toDateString()) return "TOMORROW";
    return d.toLocaleDateString();
  };

  const isLiveMatch = (date: string, time: string) => {
    const now = Date.now();
    const kickoff = new Date(`${date}T${time || "00:00:00"}Z`).getTime();
    return now >= kickoff && now <= kickoff + 2 * 60 * 60 * 1000;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const leagueIds = LEAGUES.filter(l => l.id !== 0).map(l => l.id);

        const requests = leagueIds.map(id => 
          axios.get(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsseason.php?id=${id}`)
        );

        const results = await Promise.all(requests);
        const allEvents = results.flatMap(res => res.data.events || []);

        const now = new Date();

        // ✅ FIXED FILTER
        const upcomingEvents = allEvents.filter((event: any) => {
          if (!event.dateEvent) return false;

          const eventDate = new Date(`${event.dateEvent}T${event.strTime || "00:00:00"}Z`);
          return !isNaN(eventDate.getTime()) && eventDate >= now;
        });

        const mapped = upcomingEvents.map((event: any) => ({
          fixture: { id: parseInt(event.idEvent) },
          league: { id: parseInt(event.idLeague), name: event.strLeague },
          time: event.strTime,
          date: event.dateEvent,
          teams: {
            home: { id: parseInt(event.idHomeTeam), name: event.strHomeTeam },
            away: { id: parseInt(event.idAwayTeam), name: event.strAwayTeam }
          }
        }));

        // ✅ FIXED SORT
        setFixtures(mapped.sort((a, b) => {
          const d1 = new Date(`${a.date}T${a.time || "00:00:00"}Z`).getTime();
          const d2 = new Date(`${b.date}T${b.time || "00:00:00"}Z`).getTime();
          return d1 - d2;
        }));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔽 EVERYTHING BELOW UNCHANGED

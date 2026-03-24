import React from 'react';
import dbConnect from '../lib/dbConnect';
import Match from "../lib/models/match";
import { Trophy, Clock, AlertCircle } from 'lucide-react';

async function getMatches() {
  try {
    await dbConnect();
    const matches = await Match.find({}).sort({ date: -1 }).limit(10);
    return JSON.parse(JSON.stringify(matches));
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Trophy /> GoalPro V2
      </h1>
      <div className="grid gap-4">
        {matches.length > 0 ? (
          matches.map((match: any) => (
            <div key={match._id} className="p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex justify-between font-bold">
                <span>{match.homeTeam}</span>
                <span>VS</span>
                <span>{match.awayTeam}</span>
              </div>
              <div className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <Clock size={14} /> {match.date}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-10 border border-dashed rounded-lg">
            <AlertCircle className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No matches found. Ensure your scraper is working.</p>
          </div>
        )}
      </div>
    </main>
  );
}

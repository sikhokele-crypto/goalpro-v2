import React from 'react';
import dbConnect from '../lib/dbConnect';
import Match from '../models/Match';
import { Trophy, Clock, Zap, AlertCircle } from 'lucide-react';

async function getMatches() {
  try {
    await dbConnect();
    // Finding matches from the database
    const matches = await Match.find({}).sort({ date: -1 }).limit(10);
    return JSON.parse(JSON.stringify(matches));
  } catch (e) {
    console.error("Database error:", e);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
          <Trophy className="text-yellow-500 w-8 h-8" /> 
          GoalPro V2 Live
        </h1>
        
        <div className="grid gap-4">
          {matches.length > 0 ? (
            matches.map((match: any) => (
              <div key={match._id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{match.homeTeam}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">VS</span>
                  <span className="font-semibold text-lg">{match.awayTeam}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {new Date(match.date).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No matches found. Run the scraper to populate data.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

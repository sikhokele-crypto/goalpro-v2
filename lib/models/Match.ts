import mongoose, { Schema, model, models } from 'mongoose';

const MatchSchema = new Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  league: { type: String, required: true },
  startTime: { type: Date, required: true },
  over15Prob: { type: Number, required: true },
  odds: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
});

const Match = models.Match || model('Match', MatchSchema);

export default Match;

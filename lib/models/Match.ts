import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  homeTeam: String,
  awayTeam: String,
  league: String,
  startTime: Date,
  prediction: String,
  probability: String,
  isElite: Boolean,
});

export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

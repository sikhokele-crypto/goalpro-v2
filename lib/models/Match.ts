import mongoose, { Schema, model, models } from 'mongoose';

const MatchSchema = new Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  date: { type: Date, required: true },
  score: { type: String },
}, { timestamps: true });

const Match = models.Match || model('Match', MatchSchema);
export default Match;

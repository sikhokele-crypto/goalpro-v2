import mongoose, { Schema, model, models } from 'mongoose';

const MatchSchema = new Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  league: { type: String },
  startTime: { type: Date, required: true },
  prediction: { type: String },
  probability: { type: String },
  isElite: { type: Boolean, default: false },
  status: { type: String, default: 'upcoming' }
}, { timestamps: true });

// Check if model exists to prevent re-compilation errors in Next.js
const Match = models.Match || model('Match', MatchSchema);
export default Match;

import mongoose, { Schema, model, models } from 'mongoose';

const MatchSchema = new Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  probability: { type: String, required: true },
  time: { type: String, required: true },
  league: { type: String },
  prediction: { type: String }, // e.g., "Home Win"
  odds: { type: String },
}, { timestamps: true });

// This prevents Mongoose from creating the model twice during hot-reloads
const Match = models.Match || model('Match', MatchSchema);

export default Match;

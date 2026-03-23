import mongoose, { Schema, model, models } from 'mongoose';

const MatchSchema = new Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  probability: { type: String, required: true },
  time: { type: String, required: true },
  league: { type: String },
  prediction: { type: String },
  odds: { type: String },
}, { timestamps: true });

const Match = models.Match || model('Match', MatchSchema);
export default Match; // <--- This must be "export default"

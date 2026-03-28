import mongoose, { Schema, model, models } from "mongoose";

const MatchSchema = new Schema(
  {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    league: { type: String },
    date: { type: String, required: true },
    prediction: { type: String },
    probability: { type: String },
    isElite: { type: Boolean, default: false },
    odds: {
      home: { type: Number },
      draw: { type: Number },
      away: { type: Number },
    },
  },
  { timestamps: true }
);

const Match = models.Match || model("Match", MatchSchema);
export default Match;

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
    // VIP Markets
    vipMarkets: {
      oversUnders: { type: String },
      firstHalfOvers: { type: String },
      corners: { type: String },
      doubleChance: { type: String },
      homeOvers: { type: String },
      awayOvers: { type: String },
      btts: { type: String },
      drawNoBet: { type: String },
    }
  },
  { timestamps: true }
);

const Match = models.Match || model("Match", MatchSchema);
export default Match;

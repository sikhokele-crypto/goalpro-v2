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
    vipMarkets: {
      oversUnders: { type: String },       // Overs & Unders
      firstHalfOvers: { type: String },    // 1st Half O/U
      totalCorners: { type: String },      // Total Corners
      doubleChance: { type: String },      // Double Chance
      homeTeamOvers: { type: String },     // Home Team O/U
      awayTeamOvers: { type: String },     // Away Team O/U
      btts: { type: String },              // BTTS
      drawNoBet: { type: String },         // Draw No Bet
    }
  },
  { timestamps: true }
);

const Match = models.Match || model("Match", MatchSchema);
export default Match;

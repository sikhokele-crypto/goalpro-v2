import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVip: { type: Boolean, default: false },
  vipExpiresAt: { type: Date, default: null },
  referralCount: { type: Number, default: 0 },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

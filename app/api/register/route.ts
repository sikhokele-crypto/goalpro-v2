import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/lib/models/User";

export async function POST(req: Request) {
  await dbConnect();
  const { email, password, refCode } = await req.json();

  // 1. Create the new user
  const newUser = await User.create({
    email,
    password, // Use a hashing library like bcrypt in production!
    isVip: false,
    vipExpiresAt: null
  });

  // 2. REFERRAL LOGIC: If they used a link, reward the inviter
  if (refCode) {
    const inviter = await User.findById(refCode);
    if (inviter) {
      // Add 2 days to the inviter's VIP status
      const currentExpiry = inviter.vipExpiresAt || new Date();
      const newExpiry = new Date(currentExpiry.getTime() + (2 * 24 * 60 * 60 * 1000));
      
      inviter.vipExpiresAt = newExpiry;
      inviter.isVip = true;
      await inviter.save();
    }
  }

  return NextResponse.json({ success: true, message: "Account created!" });
}

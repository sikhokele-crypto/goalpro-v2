import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { User } from "../../../models/user";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "User exists" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    return NextResponse.json({ message: "Success", userId: user._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User, { type IUser } from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 檢查是否為管理員
  if (session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    await connectDB();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email role createdAt');

    // 格式化回傳資料
    const formattedUsers = users.map((user: IUser) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("獲取用戶列表失敗:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
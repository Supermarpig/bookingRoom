'use server'

import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { type User as UserType } from "@/types/schema";

export async function getUsers(): Promise<UserType[]> {
  console.log("開始獲取用戶列表");

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      throw new Error("只有管理員可以查看用戶列表");
    }

    // 連接資料庫
    await connectDB();

    // 獲取所有用戶
    const users = await User.find().sort({ createdAt: -1 });

    // 返回用戶列表
    return users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role || "USER",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("獲取用戶列表失敗:", error);
    throw error instanceof Error ? error : new Error("獲取用戶列表失敗");
  }
} 
'use server'

import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { type User as UserType } from "@/types/schema";

export async function updateUser(userId: string, role: "ADMIN" | "USER"): Promise<UserType> {
  console.log("開始更新用戶權限");

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      throw new Error("只有管理員可以更新用戶權限");
    }

    // 檢查是否嘗試更新自己的權限
    if (session.user.id === userId) {
      throw new Error("無法更改自己的權限");
    }

    // 連接資料庫
    await connectDB();

    // 更新用戶權限
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      throw new Error("找不到該用戶");
    }

    // 返回更新後的用戶資料
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role || "USER",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("更新用戶權限失敗:", error);
    throw error instanceof Error ? error : new Error("更新用戶權限失敗");
  }
} 
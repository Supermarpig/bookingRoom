'use server'

import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import { authOptions } from "@/lib/auth";


export async function deleteRoom(roomId: string): Promise<void> {
  console.log("開始刪除會議室");

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      throw new Error("只有管理員可以刪除會議室");
    }

    // 連接資料庫
    await connectDB();

    // 刪除會議室
    const result = await Room.findByIdAndDelete(roomId);

    if (!result) {
      throw new Error("找不到該會議室");
    }
  } catch (error) {
    console.error("刪除會議室失敗:", error);
    throw error instanceof Error ? error : new Error("刪除會議室失敗");
  }
} 
'use server'

import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authOptions } from "@/lib/auth";
import { DeleteQuerySchema } from "@/types/schema";

export async function deleteBooking(bookingId: string) {
  console.log("開始刪除預約:", bookingId);

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 驗證預約 ID
    const { id } = DeleteQuerySchema.parse({ id: bookingId });

    // 連接資料庫
    await connectDB();

    // 查詢預約
    const booking = await Booking.findById(id);
    if (!booking) {
      throw new Error("找不到指定的預約");
    }

    // 檢查權限
    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      throw new Error("您沒有權限刪除此預約");
    }

    // 刪除預約
    await booking.deleteOne();

    return { success: true, message: "預約已成功刪除" };
  } catch (error) {
    console.error("刪除預約失敗:", error);
    throw error instanceof Error ? error : new Error("刪除預約失敗");
  }
} 
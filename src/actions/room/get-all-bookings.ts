'use server'

import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authOptions } from "@/lib/auth";

export async function getAllBookings() {
  console.log("開始獲取所有預約記錄");

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      throw new Error("只有管理員可以查看所有預約記錄");
    }

    // 連接資料庫
    await connectDB();

    // 獲取所有預約記錄
    const bookings = await Booking.find().sort({ date: -1, timeSlot: 1 });

    // 返回預約記錄
    return bookings.map(booking => ({
      id: booking._id.toString(),
      roomId: booking.roomId.toString(),
      roomName: booking.roomName,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status || "PENDING",
      note: booking.note || "",
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("獲取預約記錄失敗:", error);
    throw error instanceof Error ? error : new Error("獲取預約記錄失敗");
  }
} 
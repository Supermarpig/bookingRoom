'use server'

import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authOptions } from "@/lib/auth";
import { type BookingStatus } from "@/types/schema";

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  console.log("開始更新預約狀態");

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      throw new Error("只有管理員可以更新預約狀態");
    }

    // 連接資料庫
    await connectDB();

    // 更新預約狀態
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      throw new Error("找不到該預約記錄");
    }

    // 返回更新後的預約資料
    return {
      id: booking._id.toString(),
      roomId: booking.roomId.toString(),
      roomName: booking.roomName,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      note: booking.note || "",
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("更新預約狀態失敗:", error);
    throw error instanceof Error ? error : new Error("更新預約狀態失敗");
  }
} 
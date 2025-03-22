'use server'

import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { authOptions } from "@/lib/auth";
import { UpdateBookingSchema, type UpdateBooking } from "@/types/schema";

export type UpdateBookingInput = UpdateBooking;

export async function updateBooking(input: UpdateBookingInput) {
  console.log("開始更新預約:", input);

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

    // 驗證輸入資料
    const validatedData = UpdateBookingSchema.parse(input);

    // 連接資料庫
    await connectDB();

    // 查詢預約
    const booking = await Booking.findById(validatedData.id);
    if (!booking) {
      throw new Error("找不到指定的預約");
    }

    // 更新預約狀態
    booking.status = validatedData.status;
    if (validatedData.note) {
      booking.note = validatedData.note;
    }

    // 保存更新
    await booking.save();

    // 返回更新後的預約資訊
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
      note: booking.note,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("更新預約失敗:", error);
    throw error instanceof Error ? error : new Error("更新預約失敗");
  }
} 
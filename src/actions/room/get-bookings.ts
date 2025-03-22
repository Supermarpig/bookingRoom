'use server'

import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { QuerySchema } from "@/types/schema";

// 擴展 QuerySchema 以確保 date 是必需的
const GetBookingsQuerySchema = QuerySchema.extend({
  roomId: z.string().min(1, "會議室 ID 不能為空"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD")
});

export type GetBookingsQuery = z.infer<typeof GetBookingsQuerySchema>;

export async function getBookings({ roomId, date }: GetBookingsQuery) {
  console.log("開始獲取預約狀態:", { roomId, date });

  try {
    // 驗證查詢參數
    const validatedQuery = GetBookingsQuerySchema.parse({ roomId, date });

    // 連接資料庫
    await connectDB();

    // 檢查會議室是否存在
    const room = await Room.findById(validatedQuery.roomId);
    if (!room) {
      throw new Error("找不到指定的會議室");
    }

    // 獲取指定日期的預約記錄
    const bookings = await Booking.find({
      roomId: validatedQuery.roomId,
      date: validatedQuery.date,
    }).sort({ timeSlot: 1 });

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
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));
  } catch (error) {
    console.error("獲取預約狀態失敗:", error);
    throw error instanceof Error ? error : new Error("獲取預約狀態失敗");
  }
} 
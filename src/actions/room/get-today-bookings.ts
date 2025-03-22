'use server'

import { format } from "date-fns";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { type Booking as BookingType } from "@/types/schema";

export async function getTodayBookings(): Promise<{
  date: string;
  bookings: Record<string, BookingType[]>;
}> {
  console.log("開始獲取今日會議室預約狀態");

  try {
    // 連接資料庫
    await connectDB();

    // 獲取今日日期
    const today = format(new Date(), "yyyy-MM-dd");

    // 獲取所有會議室
    const rooms = await Room.find().sort({ name: 1 });

    // 獲取今日所有預約
    const bookings = await Booking.find({
      date: today,
    }).sort({ timeSlot: 1 });

    // 整理每個會議室的預約狀態
    const bookingsByRoom: Record<string, BookingType[]> = {};

    rooms.forEach(room => {
      const roomId = room._id.toString();
      bookingsByRoom[roomId] = bookings
        .filter(booking => booking.roomId.toString() === roomId)
        .map(booking => ({
          id: booking._id.toString(),
          roomId: booking.roomId.toString(),
          roomName: room.name,
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
    });

    return {
      date: today,
      bookings: bookingsByRoom,
    };
  } catch (error) {
    console.error("獲取今日會議室預約狀態失敗:", error);
    throw error instanceof Error ? error : new Error("獲取今日會議室預約狀態失敗");
  }
} 
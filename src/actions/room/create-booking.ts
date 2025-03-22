'use server'

import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { authOptions } from "@/lib/auth";
import { CreateBookingSchema, type CreateBooking } from "@/types/schema";

export type CreateBookingInput = CreateBooking;

export async function createBooking(input: CreateBookingInput) {
  console.log("開始處理預約請求:", input);

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 驗證輸入資料
    const validatedData = CreateBookingSchema.parse(input);

    // 連接資料庫
    await connectDB();

    // 檢查會議室是否存在
    const room = await Room.findById(validatedData.roomId);
    if (!room) {
      throw new Error("找不到指定的會議室");
    }

    // 檢查時段是否有效
    if (!room.availableTimeSlots.includes(validatedData.timeSlot)) {
      throw new Error("無效的預約時段");
    }

    // 檢查該時段是否已被預約
    const existingBooking = await Booking.findOne({
      roomId: validatedData.roomId,
      date: validatedData.date,
      timeSlot: validatedData.timeSlot,
    });

    if (existingBooking) {
      throw new Error("該時段已被預約");
    }

    // 創建預約
    const booking = new Booking({
      roomId: validatedData.roomId,
      roomName: room.name,
      date: validatedData.date,
      timeSlot: validatedData.timeSlot,
      userId: session.user.id,
      userName: validatedData.bookedBy.name,
      userEmail: validatedData.bookedBy.email,
    });

    // 保存預約
    await booking.save();

    // 返回預約資訊
    return {
      id: booking._id.toString(),
      roomId: booking.roomId.toString(),
      roomName: booking.roomName,
      date: booking.date,
      timeSlot: booking.timeSlot,
      userName: booking.userName,
      userEmail: booking.userEmail,
      createdAt: booking.createdAt.toISOString(),
      status: "PENDING",
      note: "",
      updatedAt: booking.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("創建預約失敗:", error);
    throw error instanceof Error ? error : new Error("創建預約失敗");
  }
} 
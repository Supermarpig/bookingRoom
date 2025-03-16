import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import { format, startOfToday } from "date-fns";

export async function GET() {
  try {
    // 獲取今天的日期
    const today = startOfToday();
    const formattedDate = format(today, "yyyy-MM-dd");

    await connectDB();

    // 獲取所有會議室
    const rooms = await Room.find({}).sort({ createdAt: -1 });

    // 獲取今天的所有預約
    const bookings = await Booking.find({
      date: formattedDate,
      status: "APPROVED"
    });

    // 處理每個會議室的預約狀態
    const roomsWithStatus = rooms.map(room => ({
      id: room._id.toString(),
      name: room.name,
      imageUrl: room.imageUrl,
      location: room.location,
      capacity: room.capacity,
      area: room.area,
      bookings: bookings.filter(b => b.roomId.toString() === room._id.toString()),
      // 計算可用時段數量（假設每天有 8 個時段）
      availableSlots: 8 - bookings.filter(b => 
        b.roomId.toString() === room._id.toString()
      ).length
    }));

    return NextResponse.json(roomsWithStatus);
  } catch (error) {
    console.error("Error fetching today's room status:", error);
    return NextResponse.json(
      { error: "獲取會議室狀態失敗" },
      { status: 500 }
    );
  }
} 
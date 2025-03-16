import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { MyBookingsSchema, DeleteQuerySchema } from "@/types/schema";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectDB();

    // 從資料庫獲取預約記錄
    const bookings = await Booking.find()
      .populate("roomId", "name") // 關聯查詢房間資訊
      .sort({ createdAt: -1 }); // 按建立時間降序排序

    // 格式化預約數據
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id.toString(),
      roomId: booking.roomId._id.toString(),
      roomName: booking.roomId.name,
      date: booking.date,
      timeSlot: booking.timeSlot,
      bookedBy: {
        name: booking.bookedBy.name,
        email: booking.bookedBy.email,
      },
      status: booking.status,
    }));

    // 驗證數據格式
    const validatedBookings = MyBookingsSchema.parse(formattedBookings);
    return NextResponse.json(validatedBookings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }

    console.error("獲取預約記錄失敗:", error);
    return NextResponse.json({ error: "獲取預約記錄失敗" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 驗證查詢參數
    const query = DeleteQuerySchema.parse({
      id: request.nextUrl.searchParams.get("id"),
    });

    await connectDB();

    // 查找並刪除預約
    const booking = await Booking.findByIdAndDelete(query.id);

    if (!booking) {
      return NextResponse.json({ error: "找不到指定的預約" }, { status: 404 });
    }

    return NextResponse.json({ message: "預約已取消" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }

    console.error("取消預約失敗:", error);
    return NextResponse.json({ error: "取消預約失敗" }, { status: 500 });
  }
}

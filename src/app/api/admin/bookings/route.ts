import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授權訪問" },
        { status: 401 }
      );
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "沒有權限訪問" },
        { status: 403 }
      );
    }

    await connectDB();
    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map((booking) => ({
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
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("獲取預約列表失敗:", error);
    return NextResponse.json(
      { error: "獲取預約列表失敗" },
      { status: 500 }
    );
  }
} 
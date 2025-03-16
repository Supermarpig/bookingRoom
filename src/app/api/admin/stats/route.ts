import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 檢查是否為管理員
  if (session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    await connectDB();
    
    // 獲取今日日期（台灣時區）
    const now = new Date();
    // 轉換為台灣時區
    const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const todayStr = taiwanTime.toISOString().split('T')[0];

    // 獲取今日預約數
    const todayBookings = await Booking.countDocuments({
      date: todayStr
    });

    // 用於調試
    console.log('Taiwan time:', taiwanTime);
    console.log('Today date:', todayStr);
    console.log('Found bookings:', todayBookings);
    
    // 也列出今天的所有預約，用於調試
    const bookings = await Booking.find({ date: todayStr });
    console.log('Today\'s bookings:', JSON.stringify(bookings, null, 2));

    // 獲取會議室總數
    const totalRooms = await Room.countDocuments();

    // 獲取待審核預約數
    const pendingBookings = await Booking.countDocuments({
      status: "PENDING"
    });

    return NextResponse.json({
      todayBookings,
      totalRooms,
      pendingBookings
    });
  } catch (error) {
    console.error("獲取統計資料失敗:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
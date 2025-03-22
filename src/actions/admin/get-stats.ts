'use server'

import { getServerSession } from "next-auth";
import { format } from "date-fns";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export interface AdminStats {
  totalRooms: number;
  totalUsers: number;
  todayBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  totalBookings: number;
}

export async function getStats(): Promise<AdminStats> {
  console.log("開始獲取管理員統計資料");

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      throw new Error("只有管理員可以查看統計資料");
    }

    // 連接資料庫
    await connectDB();

    // 獲取今日日期範圍
    const today = new Date();
    // 並行獲取各項統計資料
    const [
      totalRooms,
      totalUsers,
      todayBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalBookings,
    ] = await Promise.all([
      Room.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments({
        date: format(today, "yyyy-MM-dd"),
      }),
      Booking.countDocuments({ status: "PENDING" }),
      Booking.countDocuments({ status: "APPROVED" }),
      Booking.countDocuments({ status: "REJECTED" }),
      Booking.countDocuments(),
    ]);

    return {
      totalRooms,
      totalUsers,
      todayBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalBookings,
    };
  } catch (error) {
    console.error("獲取管理員統計資料失敗:", error);
    throw error instanceof Error ? error : new Error("獲取管理員統計資料失敗");
  }
} 
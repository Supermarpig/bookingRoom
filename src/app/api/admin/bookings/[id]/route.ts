import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { BookingStatusSchema } from "@/types/schema";
import { z } from "zod";

// 更新預約狀態的請求體驗證
const UpdateBookingSchema = z.object({
  status: BookingStatusSchema,
  note: z.string().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    
    // 驗證請求體
    const validatedData = UpdateBookingSchema.parse(body);

    await connectDB();
    
    // 查找並更新預約
    const booking = await Booking.findByIdAndUpdate(
      params.id,
      {
        status: validatedData.status,
        ...(validatedData.note && { note: validatedData.note })
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { error: "找不到指定的預約" },
        { status: 404 }
      );
    }

    // 格式化回傳資料
    const formattedBooking = {
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
    };

    return NextResponse.json(formattedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }

    console.error("更新預約狀態失敗:", error);
    return NextResponse.json(
      { error: "更新預約狀態失敗" },
      { status: 500 }
    );
  }
} 
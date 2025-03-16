import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  RoomSchema,
  ParamsSchema,
  type Room as RoomType,
} from "@/types/schema";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<RoomType | { error: string; details?: z.ZodError["errors"] }>
> {
  try {
    const { params } = context;
    const { id } = await params;

    // 驗證路由參數
    const validatedParams = ParamsSchema.parse({ id });

    await connectDB();
    const room = await Room.findById(validatedParams.id);

    if (!room) {
      return NextResponse.json(
        { error: "找不到指定的會議室" },
        { status: 404 }
      );
    }

    // 格式化會議室數據
    const formattedRoom = {
      id: room._id.toString(),
      name: room.name,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
      facilities: room.facilities,
      description: room.description,
      location: room.location,
      area: room.area,
      hourlyRate: room.hourlyRate,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };

    // 驗證會議室數據
    const validatedRoom = RoomSchema.parse(formattedRoom);
    return NextResponse.json(validatedRoom);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }

    console.error("獲取會議室詳情失敗:", error);
    return NextResponse.json({ error: "獲取會議室詳情失敗" }, { status: 500 });
  }
}

// 刪除會議室
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const { id } = await params;

    await connectDB();

    // 檢查是否有相關的預約
    const bookings = await Booking.find({ roomId: id });
    if (bookings.length > 0) {
      return NextResponse.json(
        { error: "無法刪除會議室，該會議室還有未完成的預約" },
        { status: 400 }
      );
    }

    // 刪除會議室
    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      return NextResponse.json(
        { error: "找不到指定的會議室" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "會議室已成功刪除" });
  } catch (error) {
    console.error("刪除會議室失敗:", error);
    return NextResponse.json({ error: "刪除會議室失敗" }, { status: 500 });
  }
}

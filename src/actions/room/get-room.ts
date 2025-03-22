'use server'

import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import { ParamsSchema } from "@/types/schema";

export async function getRoom(roomId: string) {
  console.log("開始獲取會議室詳情:", roomId);

  try {
    // 驗證 roomId
    const { id } = ParamsSchema.parse({ id: roomId });

    // 連接資料庫
    await connectDB();

    // 查詢會議室
    const room = await Room.findById(id);
    if (!room) {
      throw new Error("找不到指定的會議室");
    }

    // 返回會議室資訊
    return {
      id: room._id.toString(),
      name: room.name,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
      facilities: room.facilities,
      description: room.description,
      location: room.location,
      area: room.area,
      hourlyRate: room.hourlyRate,
      availableTimeSlots: room.availableTimeSlots,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("獲取會議室詳情失敗:", error);
    throw error instanceof Error ? error : new Error("獲取會議室詳情失敗");
  }
} 
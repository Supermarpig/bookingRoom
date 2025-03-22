'use server'

import { getServerSession } from "next-auth";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import { authOptions } from "@/lib/auth";
import { RoomSchema } from "@/types/schema";

// 更新會議室的輸入驗證 schema
const UpdateRoomSchema = RoomSchema.pick({
  name: true,
  description: true,
  location: true,
  capacity: true,
  hourlyRate: true,
  facilities: true,
  imageUrl: true,
  availableTimeSlots: true,
}).extend({
  id: z.string().min(1, "會議室 ID 不能為空"),
});

type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;

export async function updateRoom(data: UpdateRoomInput) {
  console.log("開始更新會議室資訊:", data);

  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("請先登入");
    }

    // 檢查是否為管理員
    if (session.user.role !== "ADMIN") {
      throw new Error("只有管理員可以更新會議室資訊");
    }

    // 驗證輸入資料
    const validatedData = UpdateRoomSchema.parse(data);

    // 連接資料庫
    await connectDB();

    // 檢查會議室是否存在
    const existingRoom = await Room.findById(validatedData.id);
    if (!existingRoom) {
      throw new Error("找不到指定的會議室");
    }

    // 檢查名稱是否重複（排除自己）
    const duplicateRoom = await Room.findOne({
      _id: { $ne: validatedData.id },
      name: validatedData.name,
    });
    if (duplicateRoom) {
      throw new Error("會議室名稱已存在");
    }

    // 更新會議室資訊
    const updatedRoom = await Room.findByIdAndUpdate(
      validatedData.id,
      {
        name: validatedData.name,
        description: validatedData.description,
        location: validatedData.location,
        capacity: validatedData.capacity,
        hourlyRate: validatedData.hourlyRate,
        facilities: validatedData.facilities,
        imageUrl: validatedData.imageUrl,
        availableTimeSlots: validatedData.availableTimeSlots,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // 返回更新後的會議室資訊
    return {
      id: updatedRoom._id.toString(),
      name: updatedRoom.name,
      description: updatedRoom.description,
      location: updatedRoom.location,
      capacity: updatedRoom.capacity,
      hourlyRate: updatedRoom.hourlyRate,
      facilities: updatedRoom.facilities,
      imageUrl: updatedRoom.imageUrl,
      availableTimeSlots: updatedRoom.availableTimeSlots,
      createdAt: updatedRoom.createdAt.toISOString(),
      updatedAt: updatedRoom.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("更新會議室失敗:", error);
    throw error instanceof Error ? error : new Error("更新會議室失敗");
  }
} 
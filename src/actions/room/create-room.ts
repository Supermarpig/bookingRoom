'use server'

import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import { RoomSchema } from "@/types/schema";

// 從 RoomSchema 中移除自動生成的欄位，創建新的 Schema
const CreateRoomSchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

export async function createRoom(data: CreateRoomInput) {
  console.log("\n=== 開始創建會議室 ===");
  console.log("1. 接收到的原始數據:", JSON.stringify(data, null, 2));

  try {
    // 驗證數據
    const validatedData = CreateRoomSchema.parse(data);
    console.log("2. Zod 驗證後的數據:", JSON.stringify(validatedData, null, 2));

    await connectDB();
    console.log("3. MongoDB 連接成功");

    // 創建會議室實例
    const room = new Room({
      name: validatedData.name,
      capacity: validatedData.capacity,
      imageUrl: validatedData.imageUrl,
      facilities: validatedData.facilities,
      description: validatedData.description,
      location: validatedData.location,
      area: validatedData.area,
      hourlyRate: validatedData.hourlyRate,
      availableTimeSlots: validatedData.availableTimeSlots
    });

    console.log("4. Room 實例創建成功");
    
    // 保存數據
    const savedRoom = await room.save();
    console.log("5. 數據保存成功");

    // 格式化響應
    const formattedRoom = {
      id: savedRoom._id.toString(),
      name: savedRoom.name,
      capacity: savedRoom.capacity,
      imageUrl: savedRoom.imageUrl,
      facilities: savedRoom.facilities,
      description: savedRoom.description,
      location: savedRoom.location,
      area: savedRoom.area,
      hourlyRate: savedRoom.hourlyRate,
      availableTimeSlots: savedRoom.availableTimeSlots,
      createdAt: savedRoom.createdAt,
      updatedAt: savedRoom.updatedAt
    };

    console.log("6. 格式化後的響應數據:", JSON.stringify(formattedRoom, null, 2));
    console.log("=== 創建會議室完成 ===\n");
    
    return formattedRoom;
  } catch (error) {
    console.error("創建會議室失敗:", error);
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify({ type: 'ValidationError', details: error.errors }));
    }
    throw new Error(error instanceof Error ? error.message : "創建會議室失敗");
  }
} 
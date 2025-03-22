'use server'

import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

export async function getRooms() {
  try {
    await connectDB();
    const rooms = await Room.find({}).sort({ createdAt: -1 });
    
    // 轉換 _id 為 id
    return rooms.map(room => ({
      id: room._id.toString(),
      name: room.name,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
      facilities: room.facilities,
      description: room.description,
      location: room.location,
      area: room.area,
      hourlyRate: room.hourlyRate,
      availableTimeSlots: room.availableTimeSlots || [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));
  } catch (error) {
    console.error("獲取會議室列表失敗:", error);
    throw new Error(error instanceof Error ? error.message : "獲取會議室列表失敗");
  }
} 
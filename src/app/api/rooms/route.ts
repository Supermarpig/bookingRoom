import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

// 獲取所有會議室
export async function GET() {
  try {
    await connectDB();
    const rooms = await Room.find({}).sort({ createdAt: -1 });
    // 轉換 _id 為 id
    const formattedRooms = rooms.map(room => ({
      id: room._id.toString(),
      name: room.name,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
      facilities: room.facilities,
      description: room.description,
      location: room.location,
      area: room.area,
      hourlyRate: room.hourlyRate,
    }));
    return NextResponse.json(formattedRooms);
  } catch (error) {
    return NextResponse.json(
      { error: "獲取會議室列表失敗", errorMessage: error },
      { status: 500 }
    );
  }
}

// 創建新會議室
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    const room = await Room.create(body);
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
    };
    return NextResponse.json(formattedRoom);
  } catch (error) {
    console.error("創建會議室失敗:", error);
    return NextResponse.json({ error: "創建會議室失敗" }, { status: 500 });
  }
}

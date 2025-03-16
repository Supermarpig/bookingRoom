import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { RoomSchema, ParamsSchema, type Room } from "@/types/schema";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";

// 模擬資料庫中的會議室數據
const MOCK_ROOMS: Room[] = [
  {
    id: "1",
    name: "大型會議室 A",
    capacity: 20,
    imageUrl: "https://picsum.photos/1200/800?random=1",
    facilities: ["投影機", "WiFi", "白板"],
    description:
      "寬敞明亮的大型會議室，配備高清投影設備和完整的會議系統，適合舉辦大型會議、培訓或演講。",
    location: "3樓 301室",
    area: "50平方米",
    hourlyRate: 1000,
  },
  {
    id: "2",
    name: "中型會議室 B",
    capacity: 12,
    imageUrl: "https://picsum.photos/1200/800?random=2",
    facilities: ["電視螢幕", "WiFi", "白板"],
    description: "舒適實用的中型會議室，配備大型顯示器，適合小組會議和討論。",
    location: "2樓 201室",
    area: "30平方米",
    hourlyRate: 800,
  },
  {
    id: "3",
    name: "小型會議室 C",
    capacity: 6,
    imageUrl: "https://picsum.photos/1200/800?random=3",
    facilities: ["WiFi", "白板"],
    description: "溫馨簡約的小型會議室，適合小組討論和面試使用。",
    location: "2樓 202室",
    area: "15平方米",
    hourlyRate: 500,
  },
];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

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
      updatedAt: room.updatedAt
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
    return NextResponse.json(
      { error: "獲取會議室詳情失敗" },
      { status: 500 }
    );
  }
}

// 刪除會議室
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
    return NextResponse.json(
      { error: "刪除會議室失敗" },
      { status: 500 }
    );
  }
}

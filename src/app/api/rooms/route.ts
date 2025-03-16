import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room, { IRoom } from "@/models/Room";
import { z } from "zod";

// 創建會議室的 Schema
const CreateRoomSchema = z.object({
  name: z.string().min(1, "會議室名稱不能為空"),
  capacity: z.number().int().positive("容納人數必須為正整數"),
  imageUrl: z.string().url("必須是有效的圖片URL"),
  facilities: z.array(z.string()).min(1, "至少需要一項設施"),
  description: z.string().min(1, "描述不能為空"),
  location: z.string().min(1, "位置不能為空"),
  area: z.string().min(1, "面積不能為空"),
  hourlyRate: z.number().positive("每小時收費必須為正數"),
  availableTimeSlots: z.array(z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "時段格式必須為 HH:MM-HH:MM")).min(1, "至少需要一個可用時段"),
});

type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

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
      availableTimeSlots: room.availableTimeSlots || [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));
    return NextResponse.json(formattedRooms);
  } catch (error) {
    console.error("獲取會議室列表失敗:", error);
    return NextResponse.json(
      { error: "獲取會議室列表失敗", message: error instanceof Error ? error.message : "未知錯誤" },
      { status: 500 }
    );
  }
}

// 創建新會議室
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("\n=== 開始創建會議室 ===");
    console.log("1. 接收到的原始數據:", JSON.stringify(body, null, 2));

    // 檢查 availableTimeSlots 是否存在且為陣列
    if (!body.availableTimeSlots || !Array.isArray(body.availableTimeSlots)) {
      console.error("availableTimeSlots 不是陣列或不存在:", body.availableTimeSlots);
      return NextResponse.json(
        { error: "驗證失敗", message: "availableTimeSlots 必須是一個陣列" },
        { status: 400 }
      );
    }

    // 驗證請求數據
    let validatedData: CreateRoomInput;
    try {
      validatedData = CreateRoomSchema.parse(body);
      console.log("2. Zod 驗證後的數據:", JSON.stringify(validatedData, null, 2));
    } catch (validationError) {
      console.error("Zod 驗證失敗:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "數據驗證失敗", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }

    await connectDB();
    console.log("3. MongoDB 連接成功");

    try {
      // 使用 Mongoose 的方式創建文檔
      const roomData = {
        name: validatedData.name,
        capacity: validatedData.capacity,
        imageUrl: validatedData.imageUrl,
        facilities: validatedData.facilities,
        description: validatedData.description,
        location: validatedData.location,
        area: validatedData.area,
        hourlyRate: validatedData.hourlyRate,
        availableTimeSlots: validatedData.availableTimeSlots
      };

      // 再次確認 availableTimeSlots 是否正確
      if (!Array.isArray(roomData.availableTimeSlots) || roomData.availableTimeSlots.length === 0) {
        console.error("availableTimeSlots 不是陣列或為空:", roomData.availableTimeSlots);
        return NextResponse.json(
          { error: "驗證失敗", message: "availableTimeSlots 必須是一個非空陣列" },
          { status: 400 }
        );
      }

      // 驗證每個時段的格式
      const timeSlotRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
      const invalidTimeSlots = roomData.availableTimeSlots.filter(
        slot => !timeSlotRegex.test(slot)
      );
      if (invalidTimeSlots.length > 0) {
        console.error("發現無效的時段格式:", invalidTimeSlots);
        return NextResponse.json(
          { error: "驗證失敗", message: "時段格式必須為 HH:MM-HH:MM", invalidTimeSlots },
          { status: 400 }
        );
      }

      console.log("4. 準備創建的會議室數據:", JSON.stringify(roomData, null, 2));
      console.log("5. availableTimeSlots:", roomData.availableTimeSlots);

      try {
        // 直接使用 new Room() 創建實例
        console.log("6. 開始創建 Room 實例");
        const room = new Room({
          name: roomData.name,
          capacity: roomData.capacity,
          imageUrl: roomData.imageUrl,
          facilities: roomData.facilities,
          description: roomData.description,
          location: roomData.location,
          area: roomData.area,
          hourlyRate: roomData.hourlyRate,
          availableTimeSlots: roomData.availableTimeSlots
        });
        
        console.log("7. Room 實例創建成功:", JSON.stringify(room.toObject(), null, 2));
        console.log("8. Room 實例的 availableTimeSlots:", room.availableTimeSlots);

        // 檢查實例是否正確創建
        if (!room) {
          console.error("Room 實例創建失敗");
          return NextResponse.json(
            { error: "創建會議室失敗", message: "無法創建會議室實例" },
            { status: 500 }
          );
        }

        // 保存數據
        console.log("9. 開始保存數據");
        const savedRoom = await room.save();
        console.log("10. 數據保存成功，原始數據:", JSON.stringify(savedRoom, null, 2));
        console.log("11. savedRoom.toObject():", JSON.stringify(savedRoom.toObject(), null, 2));
        
        // 再次從數據庫中讀取以驗證
        const verifiedRoom = await Room.findById(savedRoom._id).lean() as unknown as IRoom;
        console.log("12. 驗證保存的數據:", JSON.stringify(verifiedRoom, null, 2));

        // 檢查保存是否成功
        if (!savedRoom) {
          console.error("Room 保存失敗");
          return NextResponse.json(
            { error: "創建會議室失敗", message: "無法保存會議室數據" },
            { status: 500 }
          );
        }

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
          availableTimeSlots: verifiedRoom?.availableTimeSlots || [],
          createdAt: savedRoom.createdAt,
          updatedAt: savedRoom.updatedAt
        };

        console.log("13. 格式化後的響應數據:", JSON.stringify(formattedRoom, null, 2));
        console.log("=== 創建會議室完成 ===\n");
        return NextResponse.json(formattedRoom);
      } catch (instanceError) {
        console.error("創建或保存實例時出錯:", instanceError);
        return NextResponse.json(
          { 
            error: "創建會議室失敗", 
            message: instanceError instanceof Error ? instanceError.message : "創建實例時發生錯誤",
            details: instanceError
          },
          { status: 500 }
        );
      }
    } catch (mongoError) {
      console.error("MongoDB 操作失敗:", mongoError);
      return NextResponse.json(
        { 
          error: "創建會議室失敗", 
          message: mongoError instanceof Error ? mongoError.message : "資料庫操作錯誤",
          details: mongoError
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("創建會議室失敗:", error);
    return NextResponse.json(
      { error: "創建會議室失敗", message: error instanceof Error ? error.message : "未知錯誤" },
      { status: 500 }
    );
  }
}

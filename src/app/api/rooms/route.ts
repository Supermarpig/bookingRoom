import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RoomsSchema, type Room } from '@/types/schema';

// 模擬資料庫中的會議室數據
const MOCK_ROOMS: Room[] = [
  {
    id: "1",
    name: "大型會議室 A",
    capacity: 20,
    imageUrl: "https://picsum.photos/600/400?random=1",
    facilities: ["投影機", "WiFi", "白板"],
    description: "寬敞明亮的大型會議室，配備高清投影設備和完整的會議系統，適合舉辦大型會議、培訓或演講。",
    location: "3樓 301室",
    area: "50平方米",
    hourlyRate: 1000,
  },
  {
    id: "2",
    name: "中型會議室 B",
    capacity: 12,
    imageUrl: "https://picsum.photos/600/400?random=2",
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
    imageUrl: "https://picsum.photos/600/400?random=3",
    facilities: ["WiFi", "白板"],
    description: "溫馨簡約的小型會議室，適合小組討論和面試使用。",
    location: "2樓 202室",
    area: "15平方米",
    hourlyRate: 500,
  },
];

export async function GET() {
  try {
    // 驗證所有會議室數據
    const validatedRooms = RoomsSchema.parse(MOCK_ROOMS);
    return NextResponse.json(validatedRooms);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "獲取會議室列表失敗" },
      { status: 500 }
    );
  }
} 
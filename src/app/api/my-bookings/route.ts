import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { MyBookingsSchema, DeleteQuerySchema, type MyBooking } from '@/types/schema';

// 模擬預約數據
const MOCK_MY_BOOKINGS: MyBooking[] = [
  {
    id: "1",
    roomId: "1",
    roomName: "會議室 A",
    date: "2024-03-20",
    timeSlot: "09:00-10:00",
    bookedBy: {
      name: "張小明",
      email: "ming@example.com"
    },
    status: "upcoming" // upcoming 即將到來 | completed 已完成 | cancelled 已取消
  },
  {
    id: "2",
    roomId: "2",
    roomName: "會議室 B",
    date: "2024-03-21",
    timeSlot: "14:00-15:00",
    bookedBy: {
      name: "張小明",
      email: "ming@example.com"
    },
    status: "upcoming"
  },
  {
    id: "3",
    roomId: "1",
    roomName: "會議室 A",
    date: "2024-03-15",
    timeSlot: "10:00-11:00",
    bookedBy: {
      name: "張小明",
      email: "ming@example.com"
    },
    status: "completed"
  }
];

export async function GET() {
  try {
    // 在實際應用中，這裡應該從資料庫中獲取當前登入用戶的預約記錄
    const validatedBookings = MyBookingsSchema.parse(MOCK_MY_BOOKINGS);
    return NextResponse.json(validatedBookings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "獲取預約記錄失敗" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 驗證查詢參數
    const query = DeleteQuerySchema.parse({
      id: request.nextUrl.searchParams.get('id')
    });

    // 在實際應用中，這裡應該使用 query.id 從資料庫中刪除指定的預約記錄
    const bookingToDelete = MOCK_MY_BOOKINGS.find(booking => booking.id === query.id);
    
    if (!bookingToDelete) {
      return NextResponse.json(
        { error: "找不到指定的預約" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "預約已取消" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "取消預約失敗" },
      { status: 500 }
    );
  }
} 
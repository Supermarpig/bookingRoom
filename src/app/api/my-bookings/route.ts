import { NextResponse } from 'next/server';

// 模擬預約數據
const MOCK_MY_BOOKINGS = [
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
    return NextResponse.json(MOCK_MY_BOOKINGS);
  } catch {
    return NextResponse.json(
      { error: "獲取預約記錄失敗" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { error: "預約 ID 不能為空" },
        { status: 400 }
      );
    }

    // 在實際應用中，這裡應該從資料庫中刪除指定的預約記錄
    return NextResponse.json({ message: "預約已取消" });
  } catch {
    return NextResponse.json(
      { error: "取消預約失敗" },
      { status: 500 }
    );
  }
} 
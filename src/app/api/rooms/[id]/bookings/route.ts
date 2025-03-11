import { NextResponse } from 'next/server';

// 模擬預約數據
const MOCK_BOOKINGS: { [key: string]: { date: string; timeSlot: string; bookedBy: { name: string; email: string } }[] } = {
  "1": [
    { date: "2024-03-20", timeSlot: "09:00-10:00", bookedBy: { name: "張小明", email: "ming@example.com" } },
    { date: "2024-03-20", timeSlot: "10:00-11:00", bookedBy: { name: "李小華", email: "hua@example.com" } },
    { date: "2024-03-21", timeSlot: "14:00-15:00", bookedBy: { name: "王大同", email: "tong@example.com" } },
  ],
  "2": [
    { date: "2024-03-20", timeSlot: "13:00-14:00", bookedBy: { name: "陳小芳", email: "fang@example.com" } },
    { date: "2024-03-21", timeSlot: "15:00-16:00", bookedBy: { name: "林小美", email: "mei@example.com" } },
  ],
  "3": [
    { date: "2024-03-22", timeSlot: "09:00-10:00", bookedBy: { name: "黃小強", email: "strong@example.com" } },
  ],
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 從 URL 獲取日期參數
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const roomBookings = MOCK_BOOKINGS[params.id] || [];
    
    // 如果有指定日期，只返回該日期的預約
    const filteredBookings = date
      ? roomBookings.filter(booking => booking.date === date)
      : roomBookings;

    return NextResponse.json(filteredBookings);
  } catch (error) {
    return NextResponse.json(
      { error: "獲取預約狀態失敗" },
      { status: 500 }
    );
  }
} 
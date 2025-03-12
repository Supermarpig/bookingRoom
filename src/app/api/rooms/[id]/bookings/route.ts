import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { BookingSchema, QuerySchema, type Booking } from '@/types/schema';

// 模擬預約數據
const MOCK_BOOKINGS: { [key: string]: Booking[] } = {
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證路由參數
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少必要參數", message: "請提供會議室 ID" },
        { status: 400 }
      );
    }

    // 獲取日期參數
    const dateParam = request.nextUrl.searchParams.get('date');
    console.log('收到的日期參數:', dateParam);

    // 驗證日期格式
    if (dateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateParam)) {
        return NextResponse.json(
          { error: "日期格式不正確", message: "日期格式必須為 YYYY-MM-DD" },
          { status: 400 }
        );
      }

      // 驗證日期是否有效
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "日期無效", message: "請提供有效的日期" },
          { status: 400 }
        );
      }

      // 驗證日期範圍
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      maxDate.setHours(23, 59, 59, 999);

      if (date < today) {
        return NextResponse.json(
          { error: "日期無效", message: "不能選擇過去的日期" },
          { status: 400 }
        );
      }

      if (date > maxDate) {
        return NextResponse.json(
          { error: "日期無效", message: "只能預約未來30天內的時段" },
          { status: 400 }
        );
      }
    }

    // 驗證查詢參數
    const query = QuerySchema.parse({ date: dateParam });
    console.log('驗證後的查詢參數:', query);

    const roomBookings = MOCK_BOOKINGS[id] || [];
    console.log('房間預約記錄:', roomBookings);
    
    // 驗證預約數據
    const validatedBookings = z.array(BookingSchema).parse(roomBookings);
    console.log('驗證後的預約記錄:', validatedBookings);
    
    // 如果有指定日期，只返回該日期的預約
    const filteredBookings = query.date
      ? validatedBookings.filter(booking => booking.date === query.date)
      : validatedBookings;
    console.log('過濾後的預約記錄:', filteredBookings);

    return NextResponse.json(filteredBookings);
  } catch (error) {
    console.error('發生未預期的錯誤:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "資料驗證失敗", 
          message: "請確認日期格式是否正確（YYYY-MM-DD）",
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "獲取預約狀態失敗", 
        message: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
} 
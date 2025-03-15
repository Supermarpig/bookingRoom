import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BookingSchema, QuerySchema, type Booking } from "@/types/schema";

// 模擬預約數據
const MOCK_BOOKINGS: Record<string, Booking[]> = {
  "1": [
    {
      date: "2024-03-20",
      timeSlot: "09:00-10:00",
      bookedBy: { name: "張小明", email: "ming@example.com" },
    },
    {
      date: "2024-03-20",
      timeSlot: "10:00-11:00",
      bookedBy: { name: "李小華", email: "hua@example.com" },
    },
    {
      date: "2024-03-21",
      timeSlot: "14:00-15:00",
      bookedBy: { name: "王大同", email: "tong@example.com" },
    },
  ],
  "2": [
    {
      date: "2024-03-20",
      timeSlot: "13:00-14:00",
      bookedBy: { name: "陳小芳", email: "fang@example.com" },
    },
    {
      date: "2024-03-21",
      timeSlot: "15:00-16:00",
      bookedBy: { name: "林小美", email: "mei@example.com" },
    },
  ],
  "3": [
    {
      date: "2024-03-22",
      timeSlot: "09:00-10:00",
      bookedBy: { name: "黃小強", email: "strong@example.com" },
    },
  ],
};

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "缺少必要參數", message: "請提供會議室 ID" },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");

    if (dateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateParam)) {
        return NextResponse.json(
          { error: "日期格式不正確", message: "日期格式必須為 YYYY-MM-DD" },
          { status: 400 }
        );
      }

      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "日期無效", message: "請提供有效的日期" },
          { status: 400 }
        );
      }

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

    const query = QuerySchema.parse({ date: dateParam });
    const roomBookings = MOCK_BOOKINGS[id] || [];
    const validatedBookings = z.array(BookingSchema).parse(roomBookings);

    const filteredBookings = query.date
      ? validatedBookings.filter((booking) => booking.date === query.date)
      : validatedBookings;

    return NextResponse.json(filteredBookings);
  } catch (error) {
    console.error("發生未預期的錯誤:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "資料驗證失敗",
          message: "請確認日期格式是否正確（YYYY-MM-DD）",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "獲取預約狀態失敗",
        message: error instanceof Error ? error.message : "未知錯誤",
      },
      { status: 500 }
    );
  }
};

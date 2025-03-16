import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { startOfDay, addDays } from "date-fns";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const { id } = await params;
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");

    if (!id) {
      return NextResponse.json(
        { error: "缺少必要參數", message: "請提供會議室 ID" },
        { status: 400 }
      );
    }

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

      const today = startOfDay(new Date());
      const maxDate = addDays(today, 30);

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

    await connectDB();
    const query = dateParam ? { roomId: id, date: dateParam } : { roomId: id };
    const bookings = await Booking.find(query).sort({ date: 1, timeSlot: 1 });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("獲取預約狀態失敗:", error);
    return NextResponse.json(
      {
        error: "獲取預約狀態失敗",
        message: error instanceof Error ? error.message : "未知錯誤",
      },
      { status: 500 }
    );
  }
}

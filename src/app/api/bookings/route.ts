import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, date, timeSlot } = body;

    // 驗證必要欄位
    if (!roomId || !date || !timeSlot) {
      return NextResponse.json(
        { error: "缺少必要欄位" },
        { status: 400 }
      );
    }

    // 模擬預約成功
    return NextResponse.json({
      success: true,
      message: "預約成功",
      booking: {
        id: Math.random().toString(36).substr(2, 9),
        roomId,
        date,
        timeSlot,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "預約失敗" },
      { status: 500 }
    );
  }
} 
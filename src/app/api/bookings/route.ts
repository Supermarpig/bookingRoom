import { NextResponse } from "next/server";
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { CreateBookingSchema } from '@/types/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 驗證請求數據
    const validatedData = CreateBookingSchema.parse(body);

    // 模擬預約成功
    return NextResponse.json({
      success: true,
      message: "預約成功",
      booking: {
        id: Math.random().toString(36).substr(2, 9),
        ...validatedData,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料驗證失敗", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "預約失敗" },
      { status: 500 }
    );
  }
}

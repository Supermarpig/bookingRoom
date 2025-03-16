import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Booking from '@/models/Booking';

// 獲取用戶的所有預約
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const bookings = await Booking.find({
      userId: session.user.id
    }).sort({ createdAt: -1 });

    // 格式化預約資料
    const formattedBookings = bookings.map(booking => ({
      id: booking._id.toString(),
      roomId: booking.roomId.toString(),
      roomName: booking.roomName,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('獲取預約列表失敗:', error);
    return NextResponse.json(
      { error: '獲取預約列表失敗' },
      { status: 500 }
    );
  }
}

// 創建新預約
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    // 檢查會議室是否存在
    const room = await Room.findById(body.roomId);
    if (!room) {
      return NextResponse.json(
        { error: '會議室不存在' },
        { status: 404 }
      );
    }

    // 檢查時段是否已被預約
    const existingBooking = await Booking.findOne({
      roomId: body.roomId,
      date: body.date,
      timeSlot: body.timeSlot,
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: '該時段已被預約' },
        { status: 400 }
      );
    }

    // 創建預約
    const booking = await Booking.create({
      ...body,
      userId: session.user.id,
      userName: session.user.name || body.bookedBy.name,
      userEmail: session.user.email || body.bookedBy.email,
      roomName: room.name,
      status: 'PENDING'
    });

    // 格式化回傳資料
    const formattedBooking = {
      id: booking._id.toString(),
      roomId: booking.roomId.toString(),
      roomName: booking.roomName,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    return NextResponse.json(formattedBooking);
  } catch (error) {
    console.error('創建預約失敗:', error);
    return NextResponse.json(
      { error: '創建預約失敗' },
      { status: 500 }
    );
  }
}

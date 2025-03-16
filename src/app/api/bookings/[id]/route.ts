import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

// 更新預約狀態
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const { params } = context;
    const { id } = await params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: body.status,
        note: body.note,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: "預約不存在" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("更新預約失敗:", error);
    return NextResponse.json({ error: "更新預約失敗" }, { status: 500 });
  }
}

// 刪除預約
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    const { params } = context;
    const { id } = await params;
    const booking = await Booking.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "預約不存在或無權限刪除" },
        { status: 404 }
      );
    }

    await Booking.findByIdAndDelete(id);

    return NextResponse.json({ message: "預約已成功刪除" });
  } catch (error) {
    console.error("刪除預約失敗:", error);
    return NextResponse.json({ error: "刪除預約失敗" }, { status: 500 });
  }
}

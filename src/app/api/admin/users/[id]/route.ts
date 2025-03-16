import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 檢查是否為管理員
  if (session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    // 連接到資料庫
    await connectDB();
    
    const { id } = await params;
    const { isAdmin } = await request.json();

    // 不允許修改自己的權限
    if (session.user.id === id) {
      return new NextResponse("Cannot modify own admin status", { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: isAdmin ? "ADMIN" : "USER" },
      { 
        new: true,
        select: "id name email role"
      }
    );

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

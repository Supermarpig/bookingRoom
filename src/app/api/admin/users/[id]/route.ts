import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 檢查是否為管理員
  if (!session.user.isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 不允許修改自己的權限
  if (session.user.id === params.id) {
    return new NextResponse("Cannot modify own admin status", { status: 400 });
  }

  try {
    const { isAdmin } = await request.json();

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        isAdmin,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "@/components/admin/columns";
import { bookingSchema } from "@/types/booking";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // 模擬從 API 或資料庫獲取資料
  const bookings = [
    {
      id: "1",
      roomId: "1",
      roomName: "會議室 A",
      userId: "1",
      userName: "使用者 A",
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // 可以加入更多測試資料
  ];

  const parsedBookings = bookings.map((booking) => {
    return bookingSchema.parse(booking);
  });

  

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">預約管理後台</h1>
      <DataTable columns={columns} data={parsedBookings} />
    </div>
  );
}

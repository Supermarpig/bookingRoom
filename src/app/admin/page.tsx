"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalRooms: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/admin")}`);
    } else if (status === "authenticated") {
      // 檢查是否為管理員
      const user = session?.user as ExtendedUser;
      if (user?.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchStats();
    }
  }, [status, router, session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("獲取統計數據失敗");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2be]"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理員儀表板</h1>
          <p className="mt-2 text-gray-600">歡迎回來，{session.user.name || session.user.email}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/rooms" className="block">
            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#00d2be]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  會議室管理
                </CardTitle>
                <CardDescription className="mt-2">
                  管理會議室資訊，包括新增、編輯和刪除會議室
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/bookings" className="block">
            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#00d2be]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  預約管理
                </CardTitle>
                <CardDescription className="mt-2">
                  查看和管理所有會議室預約記錄，處理預約申請
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/users" className="block">
            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#00d2be]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  用戶管理
                </CardTitle>
                <CardDescription className="mt-2">
                  管理系統用戶權限和資訊，查看用戶活動記錄
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快速統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">今日預約</CardTitle>
                <p className="text-3xl font-bold text-[#00d2be]">{stats.todayBookings}</p>
              </CardHeader>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">會議室總數</CardTitle>
                <p className="text-3xl font-bold text-[#00d2be]">{stats.totalRooms}</p>
              </CardHeader>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">待審核預約</CardTitle>
                <p className="text-3xl font-bold text-[#00d2be]">{stats.pendingBookings}</p>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

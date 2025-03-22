"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { type Booking } from "@/types/schema";
import { updateBooking } from "@/actions/room/update-booking";
import { getAllBookings } from "@/actions/room/get-all-bookings";

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      // 檢查是否為管理員
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchBookings();
    }
  }, [status, router, session]);

  const fetchBookings = async () => {
    try {
      const data = await getAllBookings();
      
      // 自動審核邏輯
      for (const booking of data) {
        if (booking.status === "PENDING") {
          // 檢查是否有其他已核准的預約在同一時段
          const conflictingBooking = data.find(
            (b: Booking) => 
              b.status === "APPROVED" && 
              b.date === booking.date && 
              b.timeSlot === booking.timeSlot &&
              b.roomId === booking.roomId
          );

          // 自動核准或拒絕
          const newStatus = conflictingBooking ? "REJECTED" : "APPROVED";
          
          await updateBooking({
            id: booking.id,
            status: newStatus,
            note: conflictingBooking 
              ? "該時段已有其他預約" 
              : "系統自動核准"
          });
        }
      }

      // 重新獲取更新後的預約記錄
      const updatedData = await getAllBookings();
      setBookings(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "獲取預約記錄失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedBooking || !actionType) return;

    try {
      await updateBooking({
        id: selectedBooking.id,
        status: actionType,
        note: actionType === "APPROVED" 
          ? "管理員手動核准" 
          : "管理員手動拒絕"
      });

      await fetchBookings();
      setIsActionModalOpen(false);
      setSelectedBooking(null);
      setActionType(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失敗");
    }
  };

  const openActionModal = (booking: Booking, action: "APPROVED" | "REJECTED") => {
    setSelectedBooking(booking);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const filteredBookings = bookings.filter((booking) => 
    statusFilter === "ALL" ? true : booking.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-500 bg-yellow-50";
      case "APPROVED":
        return "text-green-500 bg-green-50";
      case "REJECTED":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "待審核";
      case "APPROVED":
        return "已核准";
      case "REJECTED":
        return "已拒絕";
      default:
        return status;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2be]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">預約管理</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="ALL">全部狀態</option>
          <option value="PENDING">待審核</option>
          <option value="APPROVED">已核准</option>
          <option value="REJECTED">已拒絕</option>
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">目前沒有符合條件的預約記錄</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {booking.roomName}
                  </h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>預約日期：{booking.date}</p>
                    <p>預約時段：{booking.timeSlot}</p>
                    <p>預約者：{booking.userName}</p>
                    <p>電子郵件：{booking.userEmail}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                  {booking.status === "PENDING" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openActionModal(booking, "APPROVED")}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                      >
                        核准
                      </button>
                      <button
                        onClick={() => openActionModal(booking, "REJECTED")}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                      >
                        拒絕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedBooking(null);
          setActionType(null);
        }}
        title={`確認${actionType === "APPROVED" ? "核准" : "拒絕"}預約`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            確定要{actionType === "APPROVED" ? "核准" : "拒絕"}這個預約嗎？
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {actionType === "APPROVED"
              ? "核准後，預約者將收到通知。"
              : "拒絕後，該時段將重新開放預約。"}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setIsActionModalOpen(false);
                setSelectedBooking(null);
                setActionType(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              返回
            </button>
            <button
              onClick={handleAction}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                actionType === "APPROVED"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              確認{actionType === "APPROVED" ? "核准" : "拒絕"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 
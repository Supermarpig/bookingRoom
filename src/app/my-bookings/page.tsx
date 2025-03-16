"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { type MyBooking } from "@/types/schema";

export default function MyBookingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/my-bookings")}`);
    } else if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) {
        throw new Error("獲取預約記錄失敗");
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "獲取預約記錄失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;

    try {
      const response = await fetch(`/api/bookings/${selectedBookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("取消預約失敗");
      }

      // 重新獲取預約列表
      await fetchBookings();
      setIsConfirmModalOpen(false);
      setSelectedBookingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "取消預約失敗");
    }
  };

  const openCancelModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsConfirmModalOpen(true);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的預約</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">目前沒有任何預約記錄</p>
          <Link
            href="/rooms"
            className="inline-block bg-[#00d2be] hover:bg-[#00bfad] text-white px-6 py-2 rounded-lg transition-colors"
          >
            立即預約會議室
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
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
                    <button
                      onClick={() => openCancelModal(booking.id)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      取消預約
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedBookingId(null);
        }}
        title="確認取消預約"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
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
            確定要取消這個預約嗎？
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            取消後將無法恢復，請確認您的選擇。
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setIsConfirmModalOpen(false);
                setSelectedBookingId(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              返回
            </button>
            <button
              onClick={handleCancelBooking}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              確認取消
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 
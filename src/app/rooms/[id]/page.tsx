"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/components/Modal";

interface Room {
  id: string;
  name: string;
  capacity: number;
  imageUrl: string;
  facilities: string[];
  description: string;
  location: string;
  area: string;
  hourlyRate: number;
}

interface Booking {
  date: string;
  timeSlot: string;
  bookedBy: {
    name: string;
    email: string;
  };
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookerName, setBookerName] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([]);

  // 模擬時段數據
  const timeSlots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
  ];

  useEffect(() => {
    fetchRoomDetails();
  }, [params.id]);

  // 當日期改變時，獲取該日期的預約狀態
  useEffect(() => {
    if (selectedDate) {
      fetchBookingStatus();
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate, params.id]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`);
      if (!response.ok) {
        throw new Error("獲取會議室詳情失敗");
      }
      const data = await response.json();
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "找不到指定的會議室");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStatus = async () => {
    try {
      const response = await fetch(
        `/api/rooms/${params.id}/bookings?date=${selectedDate}`
      );
      if (!response.ok) {
        throw new Error("獲取預約狀態失敗");
      }
      const bookings: Booking[] = await response.json();
      setBookedSlots(bookings);
    } catch (err) {
      console.error("獲取預約狀態失敗:", err);
    }
  };

  // 獲取明天的日期作為最小可選日期
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // 獲取30天後的日期作為最大可選日期
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert("請選擇預約日期和時段");
      return;
    }

    if (!bookerName || !bookerEmail) {
      alert("請填寫預約者姓名和電子郵件");
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: params.id,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          bookedBy: {
            name: bookerName,
            email: bookerEmail
          }
        }),
      });

      if (!response.ok) {
        throw new Error("預約失敗");
      }

      await response.json();
      setIsSuccessModalOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "預約失敗");
    }
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    // 清空表單
    setSelectedDate("");
    setSelectedTimeSlot("");
    setBookerName("");
    setBookerEmail("");
    // 導航回會議室列表
    router.push("/rooms");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2be]"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || "找不到指定的會議室"}</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/rooms"
            className="text-[#00d2be] hover:text-[#00bfad] flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回會議室列表
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左側：房間資訊 */}
          <div>
            <div className="relative h-[400px] rounded-lg overflow-hidden bg-[#00d2be]/10">
              <Image
                src={room.imageUrl}
                alt={room.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {room.name}
              </h1>
              <p className="text-gray-600 mb-4">{room.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">位置</h3>
                  <p className="text-gray-900">{room.location}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">面積</h3>
                  <p className="text-gray-900">{room.area}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">容納人數</h3>
                  <p className="text-gray-900">{room.capacity} 人</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">每小時收費</h3>
                  <p className="text-gray-900">NT$ {room.hourlyRate}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  設施配備
                </h3>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm text-[#00d2be] bg-[#00d2be]/10 rounded-full"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右側：預約表單 */}
          <div className="bg-white p-6 rounded-lg shadow-lg h-fit sticky top-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">預約時段</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  預約者姓名
                </label>
                <input
                  type="text"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  placeholder="請輸入姓名"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2be]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <input
                  type="email"
                  value={bookerEmail}
                  onChange={(e) => setBookerEmail(e.target.value)}
                  placeholder="請輸入電子郵件"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2be]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇日期
                </label>
                <input
                  type="date"
                  min={minDate}
                  max={maxDateStr}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2be]"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTimeSlot(""); // 清空已選時段
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇時段
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => {
                    const booking = bookedSlots.find(b => b.timeSlot === slot);
                    const isBooked = Boolean(booking);
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                          ${
                            isBooked
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                              : selectedTimeSlot === slot
                              ? "bg-[#00d2be] text-white border-transparent"
                              : "border-gray-300 text-gray-700 hover:border-[#00d2be]"
                          }`}
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        {slot}
                        {isBooked && booking && (
                          <div className="text-xs">
                            <span className="block text-red-500">已預約</span>
                            <span className="block text-gray-500">預約者：{booking.bookedBy.name}</span>
                            <span className="block text-gray-500 truncate">{booking.bookedBy.email}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-[#00d2be] hover:bg-[#00bfad] text-white py-3 rounded-lg font-medium transition-colors mt-6"
              >
                立即預約
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
        title="預約成功"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            會議室預約成功！
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            您已成功預約 {room.name}
            <br />
            預約者：{bookerName}
            <br />
            電子郵件：{bookerEmail}
            <br />
            日期：{selectedDate}
            <br />
            時段：{selectedTimeSlot}
          </p>
          <button
            onClick={handleModalClose}
            className="w-full bg-[#00d2be] hover:bg-[#00bfad] text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            返回會議室列表
          </button>
        </div>
      </Modal>
    </>
  );
}

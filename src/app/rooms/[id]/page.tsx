"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { type Room, type Booking } from "@/types/schema";
import { cn } from "@/lib/utils";
import { format, startOfToday, addDays } from "date-fns";
import { zhTW } from "date-fns/locale";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookerName, setBookerName] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([]);
  const [touched, setTouched] = useState({
    name: false,
    email: false
  });

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

  // 設定日期範圍
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const maxDate = addDays(today, 30);

  const fetchRoomDetails = useCallback(async () => {
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
  }, [params.id]);

  const fetchBookingStatus = useCallback(async () => {
    if (!selectedDate) return;
    
    try {
      // 確保日期格式正確
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log('發送請求的日期:', formattedDate);
      
      const response = await fetch(
        `/api/rooms/${params.id}/bookings?date=${formattedDate}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API 錯誤回應:', errorData);
        throw new Error(errorData.message || errorData.error || '獲取預約狀態失敗');
      }
      
      const bookings: Booking[] = await response.json();
      console.log('收到的預約資料:', bookings);
      setBookedSlots(bookings);
      setError(null); // 清除之前的錯誤
    } catch (err) {
      console.error('獲取預約狀態失敗:', err);
      const errorMessage = err instanceof Error ? err.message : '獲取預約狀態失敗';
      setError(errorMessage);
      setBookedSlots([]); // 清空預約記錄
    }
  }, [params.id, selectedDate]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  useEffect(() => {
    if (selectedDate) {
      console.log('日期已選擇，正在獲取預約狀態...');
      setSelectedTimeSlot(""); // 當日期改變時，清空已選時段
      fetchBookingStatus();
    } else {
      console.log('未選擇日期');
      setBookedSlots([]);
    }
  }, [selectedDate, fetchBookingStatus]);

  const handleDateSelect = (date: Date | undefined) => {
    console.log('選擇新日期:', date);
    setSelectedDate(date);
  };

  const handleBooking = async () => {
    // 設置所有欄位為已觸碰
    setTouched({
      name: true,
      email: true
    });

    if (!selectedDate || !selectedTimeSlot) {
      alert("請選擇預約日期和時段");
      return;
    }

    if (!bookerName || !bookerEmail) {
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookerEmail)) {
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
          date: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: selectedTimeSlot,
          bookedBy: {
            name: bookerName,
            email: bookerEmail
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "預約失敗");
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
    setSelectedDate(undefined);
    setSelectedTimeSlot("");
    setBookerName("");
    setBookerEmail("");
    // 重置觸碰狀態
    setTouched({
      name: false,
      email: false
    });
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
          <Button
            variant="ghost"
            asChild
            className="text-[#00d2be] hover:text-[#00bfad] hover:bg-[#00d2be]/10"
          >
            <Link href="/rooms" className="flex items-center">
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
          </Button>
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
                <Input
                  type="text"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                  placeholder="請輸入姓名"
                  className={cn(
                    touched.name && !bookerName && "border-red-500 focus-visible:ring-red-500"
                  )}
                  required
                />
                {touched.name && !bookerName && (
                  <p className="mt-1 text-sm text-red-500">
                    請輸入預約者姓名
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <Input
                  type="email"
                  value={bookerEmail}
                  onChange={(e) => setBookerEmail(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  placeholder="請輸入電子郵件"
                  className={cn(
                    touched.email && !bookerEmail && "border-red-500 focus-visible:ring-red-500",
                    touched.email && bookerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookerEmail) && "border-red-500 focus-visible:ring-red-500"
                  )}
                  required
                />
                {touched.email && !bookerEmail && (
                  <p className="mt-1 text-sm text-red-500">
                    請輸入電子郵件
                  </p>
                )}
                {touched.email && bookerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookerEmail) && (
                  <p className="mt-1 text-sm text-red-500">
                    請輸入有效的電子郵件地址
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇日期
                </label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={zhTW}
                  fromDate={tomorrow}
                  toDate={maxDate}
                  className="rounded-md border mx-auto bg-white"
                  classNames={{
                    day_selected: "bg-[#00d2be] hover:bg-[#00bfad] text-white",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                  initialFocus
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
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <Button
                        key={slot}
                        variant={isSelected ? "default" : "outline"}
                        disabled={isBooked || !selectedDate}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={cn(
                          "h-auto py-2 relative",
                          isBooked && "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200",
                          isSelected && "bg-[#00d2be] hover:bg-[#00bfad] text-white border-transparent",
                          !selectedDate && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className="w-full">
                          <div>{slot}</div>
                          {isBooked && booking && (
                            <div className="text-xs mt-1">
                              <span className="block text-red-500">已預約</span>
                              <span className="block text-gray-500">預約者：{booking.bookedBy.name}</span>
                              <span className="block text-gray-500 truncate">{booking.bookedBy.email}</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleBooking}
                className="w-full bg-[#00d2be] hover:bg-[#00bfad] text-white"
                disabled={!selectedDate || !selectedTimeSlot || !bookerName || !bookerEmail}
              >
                立即預約
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>預約成功</DialogTitle>
            <DialogDescription>
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
                <div className="text-sm text-gray-500 space-y-1">
                  <p>您已成功預約 {room.name}</p>
                  <p>預約者：{bookerName}</p>
                  <p>電子郵件：{bookerEmail}</p>
                  <p>日期：{selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}</p>
                  <p>時段：{selectedTimeSlot}</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleModalClose} className="w-full">
              返回會議室列表
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

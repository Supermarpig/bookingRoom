"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Circle } from "lucide-react";
import { getRooms } from "@/actions/room/get-rooms";
import { getTodayBookings } from "@/actions/room/get-today-bookings";

interface RoomStatus {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
  capacity: number;
  area: string;
  bookings: Array<{
    timeSlot: string;
    status: string;
  }>;
  availableSlots: number;
}

export default function Home() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // 並行獲取會議室和預約狀態
        const [roomsData, bookingsData] = await Promise.all([
          getRooms(),
          getTodayBookings()
        ]);

        // 整理資料
        const roomsWithStatus = roomsData.map(room => ({
          id: room.id,
          name: room.name,
          imageUrl: room.imageUrl,
          location: room.location,
          capacity: room.capacity,
          area: room.area,
          bookings: (bookingsData.bookings[room.id] || []).map(booking => ({
            timeSlot: booking.timeSlot,
            status: booking.status === "APPROVED" ? "booked" : "available"
          })),
          availableSlots: room.availableTimeSlots.length - (bookingsData.bookings[room.id] || [])
            .filter(booking => booking.status === "APPROVED")
            .length
        }));

        setRooms(roomsWithStatus);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // 取得當前時段
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 9) return "09:00-10:00";
    if (hour >= 17) return "16:00-17:00";
    return `${hour.toString().padStart(2, "0")}:00-${(hour + 1).toString().padStart(2, "0")}:00`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2be]"></div>
      </div>
    );
  }

  const currentTimeSlot = getCurrentTimeSlot();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            會議室狀態
          </h1>
          <p className="text-sm text-gray-600">
            {format(new Date(), "yyyy年MM月dd日 EEEE", { locale: zhTW })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {rooms.map((room) => {
            const currentBooking = room.bookings.find(b => b.timeSlot === currentTimeSlot);
            const isInUse = currentBooking?.status === "booked";

            return (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer bg-white overflow-hidden">
                  <div className="flex items-center p-3 gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={room.imageUrl}
                        alt={room.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h2 className="text-sm font-medium text-gray-900 truncate">
                          {room.name}
                        </h2>
                        <Circle 
                          className={`w-2 h-2 flex-shrink-0 ${isInUse ? "fill-red-500 text-red-500" : "fill-green-500 text-green-500"}`}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{room.location}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          <span>{room.capacity}人</span>
                        </div>
                      </div>
                      <Badge 
                        variant={isInUse ? "destructive" : "default"}
                        className="mt-1.5 text-[10px] font-normal"
                      >
                        {isInUse ? "使用中" : "空閒中"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

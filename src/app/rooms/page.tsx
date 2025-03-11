"use client";

import { useState, useEffect } from "react";
import RoomCard from "@/components/RoomCard";

interface Room {
  id: string;
  name: string;
  capacity: number;
  imageUrl: string;
  facilities: string[];
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (!response.ok) {
        throw new Error("獲取會議室列表失敗");
      }
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCapacity =
      selectedCapacity === "all" ||
      (selectedCapacity === "small" && room.capacity <= 6) ||
      (selectedCapacity === "medium" &&
        room.capacity > 6 &&
        room.capacity <= 12) ||
      (selectedCapacity === "large" && room.capacity > 12);

    return matchesSearch && matchesCapacity;
  });

  if (loading) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">會議室列表</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜尋會議室..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2be]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2be]"
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
            >
              <option value="all">所有容量</option>
              <option value="small">小型 (&le;6人)</option>
              <option value="medium">中型 (7-12人)</option>
              <option value="large">大型 (&gt;12人)</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          沒有符合條件的會議室
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
      )}
    </div>
  );
} 
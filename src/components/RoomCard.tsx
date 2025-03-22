import Image from 'next/image';
import Link from 'next/link';
import { type Room, type Booking } from "@/types/schema";

type RoomCardProps = Pick<Room, 'id' | 'name' | 'capacity' | 'imageUrl' | 'facilities' | 'availableTimeSlots'> & {
  bookings?: Booking[];
};

const RoomCard = ({ id, name, capacity, imageUrl, facilities, availableTimeSlots = [], bookings = [] }: RoomCardProps) => {
  // 計算當天已預約的時段數
  const bookedSlotsCount = bookings.filter(booking => booking.status === "APPROVED").length;
  const totalSlots = availableTimeSlots.length;
  const availableSlots = totalSlots - bookedSlotsCount;

  return (
    <Link href={`/rooms/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-48 bg-[#00d2be]/10">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-4 py-2">
            <div className="flex justify-between items-center text-sm">
              <span>今日可預約：{availableSlots} 個時段</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                availableSlots === 0 
                  ? 'bg-red-500' 
                  : availableSlots < totalSlots / 2 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}>
                {availableSlots === 0 
                  ? '已滿' 
                  : availableSlots < totalSlots / 2 
                    ? '尚有空位' 
                    : '充足'}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#00d2be] transition-colors">{name}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <svg className="w-5 h-5 mr-1 text-[#00d2be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>可容納 {capacity} 人</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility) => (
              <span
                key={`${id}-${facility}`}
                className="px-2 py-1 text-xs font-medium text-[#00d2be] bg-[#00d2be]/10 rounded-full"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard; 
import Image from 'next/image';
import Link from 'next/link';

interface RoomCardProps {
  id: string;
  name: string;
  capacity: number;
  imageUrl: string;
  facilities: string[];
}

const RoomCard = ({ id, name, capacity, imageUrl, facilities }: RoomCardProps) => {
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
            {facilities.map((facility, index) => (
              <span
                key={index}
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
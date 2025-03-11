import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[#00d2be]">
              會議室預約系統
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/rooms" className="text-gray-600 hover:text-[#00d2be] px-3 py-2 rounded-md text-sm font-medium">
              會議室列表
            </Link>
            <Link href="/my-bookings" className="text-gray-600 hover:text-[#00d2be] px-3 py-2 rounded-md text-sm font-medium">
              我的預約
            </Link>
            <Link href="/login" className="bg-[#00d2be] hover:bg-[#00bfad] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              登入
            </Link>
          </div>

          {/* 手機版選單按鈕 */}
          <div className="md:hidden">
            <button className="text-[#00d2be] hover:text-[#00bfad] focus:outline-none">
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
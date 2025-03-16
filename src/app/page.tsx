import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        歡迎使用會議室預約系統
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        簡單便捷的會議室預約服務，幫助您更有效率地管理會議空間
      </p>
      <div className="flex gap-4">
        <Link
          href="/rooms"
          className="bg-[#00d2be] hover:bg-[#00bfad] text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
        >
          瀏覽會議室
        </Link>
        <Link
          href={`/auth/signin?callbackUrl=${encodeURIComponent("/")}`}
          className="border-2 border-[#00d2be] text-[#00d2be] hover:bg-[#00d2be] hover:text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
        >
          立即登入
        </Link>
      </div>
    </div>
  );
}

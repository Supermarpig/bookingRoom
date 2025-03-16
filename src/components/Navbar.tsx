"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { LogOut, User, Menu } from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-[#00d2be] hover:text-[#00bfad] transition-colors"
            >
              會議室預約系統
            </Link>
          </div>

          {/* 桌面版選單 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/rooms"
              className="text-gray-600 hover:text-[#00d2be] px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              會議室列表
            </Link>
            <Link
              href="/my-bookings"
              className="text-gray-600 hover:text-[#00d2be] px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              我的預約
            </Link>
            {!session ? (
              <Link
                href="/auth/signin"
                className="bg-[#00d2be] hover:bg-[#00bfad] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                登入
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 ring-2 ring-[#00d2be] ring-offset-2 ring-offset-white transition-all hover:ring-[#00bfad]">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="bg-[#00d2be] text-white">
                      {session.user?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {session.user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>後台管理</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>個人資料</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>登出</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* 手機版選單 */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="text-[#00d2be] hover:text-[#00bfad] focus:outline-none transition-colors p-2">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[300px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto py-6 px-4">
                  <SheetTitle className="text-lg font-semibold mb-4">
                    會議預約選單
                  </SheetTitle>
                  <SheetDescription className="text-sm text-gray-500 mb-4">
                    😍😍😍
                  </SheetDescription>
                  <div className="space-y-6">
                    {session && (
                      <div className="flex items-center space-x-3 mb-6 pb-6 border-b">
                        <Avatar className="h-10 w-10 ring-2 ring-[#00d2be] ring-offset-2">
                          <AvatarImage src={session.user?.image || ""} />
                          <AvatarFallback className="bg-[#00d2be] text-white">
                            {session.user?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{session.user?.name}</p>
                          <p className="text-sm text-gray-500">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                    )}
                    <Link
                      href="/rooms"
                      className="flex items-center space-x-2 text-gray-600 hover:text-[#00d2be] py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <span>會議室列表</span>
                    </Link>
                    <Link
                      href="/my-bookings"
                      className="flex items-center space-x-2 text-gray-600 hover:text-[#00d2be] py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <span>我的預約</span>
                    </Link>
                    {session?.user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 text-gray-600 hover:text-[#00d2be] py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>後台管理</span>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t">
                  {!session ? (
                    <Link
                      href="/auth/signin"
                      className="w-full bg-[#00d2be] hover:bg-[#00bfad] text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      登入
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 py-3 px-4 rounded-lg transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>登出</span>
                    </button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

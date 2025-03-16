"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Booking, BookingStatus } from "@/types/booking"
import { format } from "date-fns"
import { zhTW } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, X } from "lucide-react"
import { toast } from "sonner"

async function updateBookingStatus(id: string, status: BookingStatus) {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error('更新預約狀態失敗')
  }

  return response.json()
}

// 建立一個可重用的狀態更新按鈕組件
function BookingActions({ booking, onSuccess }: { booking: Booking, onSuccess: () => void }) {
  const isPending = booking.status === "PENDING"

  const handleStatusUpdate = async (status: BookingStatus) => {
    try {
      await updateBookingStatus(booking.id, status)
      toast.success('更新成功')
      onSuccess()
    } catch {
      toast.error('更新失敗')
    }
  }

  if (!isPending) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">開啟選單</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusUpdate('APPROVED')}>
          <Check className="mr-2 h-4 w-4" />
          <span>核准</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate('REJECTED')}>
          <X className="mr-2 h-4 w-4" />
          <span>拒絕</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "roomName",
    header: "會議室",
  },
  {
    accessorKey: "userName",
    header: "預約者",
  },
  {
    accessorKey: "startTime",
    header: "開始時間",
    cell: ({ row }) => {
      const value = row.getValue("startTime")
      return format(new Date(value as string), 'yyyy/MM/dd HH:mm', { locale: zhTW })
    },
  },
  {
    accessorKey: "endTime",
    header: "結束時間",
    cell: ({ row }) => {
      const value = row.getValue("endTime")
      return format(new Date(value as string), 'yyyy/MM/dd HH:mm', { locale: zhTW })
    },
  },
  {
    accessorKey: "status",
    header: "狀態",
    cell: ({ row }) => {
      const status = row.getValue("status") as BookingStatus
      return (
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status === 'APPROVED' ? '已核准' :
           status === 'PENDING' ? '待審核' : '已拒絕'}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      return (
        <BookingActions 
          booking={row.original} 
          onSuccess={() => {
            // 使用 table meta 來觸發重新載入
            (table.options.meta as { refresh?: () => void })?.refresh?.()
          }} 
        />
      )
    },
  },
] 
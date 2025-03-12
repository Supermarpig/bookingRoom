import { z } from 'zod';

// 基礎 schemas
export const BookerSchema = z.object({
  name: z.string().min(1, "姓名不能為空"),
  email: z.string().email("請輸入有效的電子郵件")
});

// 會議室相關 schemas
export const RoomSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "會議室名稱不能為空"),
  capacity: z.number().int().positive("容納人數必須為正整數"),
  imageUrl: z.string().url("必須是有效的圖片URL"),
  facilities: z.array(z.string()).min(1, "至少需要一項設施"),
  description: z.string().min(1, "描述不能為空"),
  location: z.string().min(1, "位置不能為空"),
  area: z.string().min(1, "面積不能為空"),
  hourlyRate: z.number().positive("每小時收費必須為正數"),
});

export const RoomsSchema = z.array(RoomSchema);

// 預約相關 schemas
export const BookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "時段格式必須為 HH:MM-HH:MM"),
  bookedBy: BookerSchema
});

export const CreateBookingSchema = z.object({
  roomId: z.string().min(1, "會議室ID不能為空"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "時段格式必須為 HH:MM-HH:MM"),
  bookedBy: BookerSchema
});

export const BookingStatusSchema = z.enum(['upcoming', 'completed', 'cancelled']);

export const MyBookingSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  roomName: z.string().min(1, "會議室名稱不能為空"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "時段格式必須為 HH:MM-HH:MM"),
  bookedBy: BookerSchema,
  status: BookingStatusSchema
});

export const MyBookingsSchema = z.array(MyBookingSchema);

// API 參數相關 schemas
export const ParamsSchema = z.object({
  id: z.string()
});

export const QuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD").optional()
});

export const DeleteQuerySchema = z.object({
  id: z.string().min(1, "預約 ID 不能為空")
});

// 類型定義
export type Room = z.infer<typeof RoomSchema>;
export type Rooms = z.infer<typeof RoomsSchema>;
export type Booker = z.infer<typeof BookerSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type MyBooking = z.infer<typeof MyBookingSchema>;
export type MyBookings = z.infer<typeof MyBookingsSchema>; 
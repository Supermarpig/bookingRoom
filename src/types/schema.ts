import { z } from 'zod';

// 基礎 schemas
export const BookerSchema = z.object({
  name: z.string().min(1, "姓名不能為空"),
  email: z.string().email("請輸入有效的電子郵件")
});

// 使用者相關 schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  image: z.string().url("必須是有效的圖片URL").nullable(),
  role: z.string().default("USER"),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
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
  availableTimeSlots: z.array(z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "時段格式必須為 HH:MM-HH:MM")).default([]),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
});

export const RoomsSchema = z.array(RoomSchema);

// 預約相關 schemas
export const BookingStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const BookingSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  roomName: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "時段格式必須為 HH:MM-HH:MM"),
  status: BookingStatusSchema,
  note: z.string().default(""),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
});

export const CreateBookingSchema = z.object({
  roomId: z.string().min(1, "會議室ID不能為空"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "時段格式必須為 HH:MM-HH:MM"),
  bookedBy: BookerSchema
});

export const UpdateBookingSchema = z.object({
  id: z.string().min(1, "預約 ID 不能為空"),
  status: BookingStatusSchema,
  note: z.string().optional(),
});

export const MyBookingSchema = BookingSchema;
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
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Room = z.infer<typeof RoomSchema>;
export type Rooms = z.infer<typeof RoomsSchema>;
export type Booker = z.infer<typeof BookerSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type MyBooking = z.infer<typeof MyBookingSchema>;
export type MyBookings = z.infer<typeof MyBookingsSchema>; 
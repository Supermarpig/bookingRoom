import { z } from "zod"

export const bookingStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"])
export type BookingStatus = z.infer<typeof bookingStatusSchema>

export const bookingSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  roomName: z.string(),
  userId: z.string(),
  userName: z.string(),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  status: bookingStatusSchema,
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type Booking = z.infer<typeof bookingSchema>

export const updateBookingSchema = z.object({
  status: bookingStatusSchema,
  note: z.string().optional(),
}) 
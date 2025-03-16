import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generate24HourTimeSlots(intervalMinutes: number = 60): string[] {
  const timeSlots: string[] = []
  const totalMinutesInDay = 24 * 60
  
  for (let minutes = 0; minutes < totalMinutesInDay; minutes += intervalMinutes) {
    const startHour = Math.floor(minutes / 60)
    const startMinute = minutes % 60
    const endHour = Math.floor((minutes + intervalMinutes) / 60)
    const endMinute = (minutes + intervalMinutes) % 60

    if (endHour >= 24) break

    const timeSlot = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}-${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
    timeSlots.push(timeSlot)
  }

  return timeSlots
}

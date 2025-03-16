import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateBookingSchema } from '@/types/booking'
import { z } from 'zod'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { status, note } = updateBookingSchema.parse(body)

    const booking = await prisma.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status,
        note,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 })
    }

    return new NextResponse('Internal error', { status: 500 })
  }
} 
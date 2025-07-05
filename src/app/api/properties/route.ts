import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import type { Session } from 'next-auth'

const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  bedrooms: z.number().min(0, 'Bedrooms must be 0 or greater'),
  bathrooms: z.number().min(0, 'Bathrooms must be 0 or greater'),
  parking: z.number().min(0, 'Parking must be 0 or greater').optional(),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'TOWNHOUSE', 'STUDIO', 'ROOM', 'OTHER']),
  rentAmount: z.number().min(0, 'Rent amount must be greater than 0'),
  features: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPropertySchema.parse(body)

    const property = await db.property.create({
      data: {
        ...validatedData,
        landlordId: session.user.id,
        rentAmount: validatedData.rentAmount * 100, // Convert to cents
        features: validatedData.features || [],
      },
      include: {
        images: true,
        landlord: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const propertyType = searchParams.get('propertyType')
    const minRent = searchParams.get('minRent')
    const maxRent = searchParams.get('maxRent')
    const bedrooms = searchParams.get('bedrooms')
    const state = searchParams.get('state')

    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'ACTIVE',
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { suburb: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    if (minRent) {
      where.rentAmount = { ...where.rentAmount, gte: parseInt(minRent) * 100 }
    }

    if (maxRent) {
      where.rentAmount = { ...where.rentAmount, lte: parseInt(maxRent) * 100 }
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms)
    }

    if (state) {
      where.state = state
    }

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        include: {
          images: true,
          landlord: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.property.count({ where }),
    ])

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
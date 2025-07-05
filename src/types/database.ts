import type { Property, PropertyImage, User, Inquiry, PropertyType, PropertyStatus } from '@prisma/client'

// Property with relations
export type PropertyWithRelations = Property & {
  images: PropertyImage[]
  landlord: {
    id: string
    name: string | null
    email: string
  }
}

// Property for listings (without full landlord details)
export interface PropertyListItem extends Property {
  images: PropertyImage[]
  landlord: {
    name: string | null
    email: string
  }
}

// Sample property for fallback data
export interface SampleProperty {
  id: string
  title: string
  address: string
  suburb: string
  state: string
  postcode: string
  bedrooms: number
  bathrooms: number
  parking: number | null
  propertyType: PropertyType
  rentAmount: number
  images: PropertyImage[]
  landlord: {
    name: string
    email: string
  }
  createdAt: Date
}

// User with relations
export interface UserWithProperties extends User {
  properties: Property[]
  inquiries: Inquiry[]
}

// Inquiry with relations
export interface InquiryWithProperty extends Inquiry {
  property: Property
  tenant: User
}

// Export Prisma generated types for convenience
export type { Property, PropertyImage, User, Inquiry, PropertyType, PropertyStatus }
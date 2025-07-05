import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a test landlord user
  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@example.com' },
    update: {},
    create: {
      email: 'landlord@example.com',
      name: 'John Smith',
      role: 'LANDLORD',
    },
  })

  // Create a test tenant user
  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@example.com' },
    update: {},
    create: {
      email: 'tenant@example.com',
      name: 'Sarah Johnson',
      role: 'TENANT',
    },
  })

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      title: 'Modern 2BR Apartment in Sydney CBD',
      description: 'A beautiful modern apartment in the heart of Sydney with stunning harbour views. Features include modern kitchen, spacious living area, and building amenities.',
      address: '123 George Street',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      propertyType: 'APARTMENT',
      rentAmount: 300000, // $3000/month in cents
      features: ['Air conditioning', 'Harbour views', 'Gym', 'Pool', 'Balcony'],
      landlordId: landlord.id,
      status: 'ACTIVE',
    },
  })

  const property2 = await prisma.property.create({
    data: {
      title: 'Charming 3BR House in Melbourne',
      description: 'A charming family home in a quiet neighborhood with a beautiful garden and modern amenities. Perfect for families.',
      address: '456 Collins Street',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      propertyType: 'HOUSE',
      rentAmount: 250000, // $2500/month in cents
      features: ['Garden', 'Air conditioning', 'Garage', 'Pet friendly'],
      landlordId: landlord.id,
      status: 'ACTIVE',
    },
  })

  const property3 = await prisma.property.create({
    data: {
      title: 'Studio Apartment near University',
      description: 'Perfect for students or young professionals. Modern studio with everything you need in a great location.',
      address: '789 University Avenue',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      bedrooms: 0,
      bathrooms: 1,
      parking: 0,
      propertyType: 'STUDIO',
      rentAmount: 120000, // $1200/month in cents
      features: ['Furnished', 'Air conditioning', 'Close to transport'],
      landlordId: landlord.id,
      status: 'ACTIVE',
    },
  })

  // Create a sample inquiry
  await prisma.inquiry.create({
    data: {
      message: 'Hi, I\'m very interested in this property. Could we arrange a viewing this weekend?',
      tenantId: tenant.id,
      propertyId: property1.id,
      status: 'PENDING',
    },
  })

  console.log('✅ Database seeding completed!')
  console.log(`Created:`)
  console.log(`- 2 users (1 landlord, 1 tenant)`)
  console.log(`- 3 properties`)
  console.log(`- 1 inquiry`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
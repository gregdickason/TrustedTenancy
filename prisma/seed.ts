import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a test landlord user
  const landlord = await db.user.upsert({
    where: { email: 'landlord@example.com' },
    update: {},
    create: {
      email: 'landlord@example.com',
      name: 'John Smith',
      role: 'LANDLORD',
    },
  })

  // Create a test tenant user
  const tenant = await db.user.upsert({
    where: { email: 'tenant@example.com' },
    update: {},
    create: {
      email: 'tenant@example.com',
      name: 'Sarah Johnson',
      role: 'TENANT',
    },
  })

  // Check and create sample properties only if they don't exist
  let property1 = await db.$.property.findFirst({
    where: {
      landlordId: landlord.id,
      address: '123 George Street',
      postcode: '2000'
    }
  })

  if (!property1) {
    property1 = await db.$.property.create({
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
    console.log('✨ Created Sydney apartment property')
  } else {
    console.log('ℹ️  Sydney apartment property already exists')
  }

  let property2 = await db.$.property.findFirst({
    where: {
      landlordId: landlord.id,
      address: '456 Collins Street',
      postcode: '3000'
    }
  })

  if (!property2) {
    property2 = await db.$.property.create({
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
    console.log('✨ Created Melbourne house property')
  } else {
    console.log('ℹ️  Melbourne house property already exists')
  }

  let property3 = await db.$.property.findFirst({
    where: {
      landlordId: landlord.id,
      address: '789 University Avenue',
      postcode: '4000'
    }
  })

  if (!property3) {
    property3 = await db.$.property.create({
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
    console.log('✨ Created Brisbane studio property')
  } else {
    console.log('ℹ️  Brisbane studio property already exists')
  }

  // Create a sample inquiry only if it doesn't exist
  const existingInquiry = await db.$.inquiry.findFirst({
    where: {
      tenantId: tenant.id,
      propertyId: property1.id
    }
  })

  if (!existingInquiry) {
    await db.$.inquiry.create({
      data: {
        message: 'Hi, I\'m very interested in this property. Could we arrange a viewing this weekend?',
        tenantId: tenant.id,
        propertyId: property1.id,
        status: 'PENDING',
      },
    })
    console.log('✨ Created sample inquiry')
  } else {
    console.log('ℹ️  Sample inquiry already exists')
  }

  // Get final counts for reporting
  const userCount = await db.$.user.count()
  const propertyCount = await db.$.property.count()
  const inquiryCount = await db.$.inquiry.count()

  console.log('✅ Database seeding completed!')
  console.log(`📊 Current database state:`)
  console.log(`- ${userCount} users total`)
  console.log(`- ${propertyCount} properties total`)
  console.log(`- ${inquiryCount} inquiries total`)
  console.log(`💡 Seeding is now idempotent - existing data is preserved!`)
}

main()
  .then(async () => {
    await db.disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await db.disconnect()
    process.exit(1)
  })
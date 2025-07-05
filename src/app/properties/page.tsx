import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default async function Properties() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let properties: any[] = []
  let dbError: string | null = null

  try {
    properties = await db.property.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        images: true,
        landlord: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    dbError = 'Unable to connect to database. Please ensure the database is running and configured properly.'
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Properties
          </h1>
          <p className="text-gray-600 mt-2">
            {properties.length} properties available for rent
          </p>
        </div>

        {dbError ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Database Connection Error
            </h2>
            <p className="text-gray-600 mb-8">
              {dbError}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-2xl mx-auto">
              <h3 className="font-medium text-yellow-800 mb-2">
                For Development Setup:
              </h3>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Copy .env.example to .env and configure DATABASE_URL</li>
                <li>Run: npx prisma generate</li>
                <li>Run: npx prisma migrate dev</li>
                <li>Or use: npx prisma dev (for local development database)</li>
              </ol>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No properties available yet
            </h2>
            <p className="text-gray-600 mb-8">
              Be the first to list your property on TrustedTenancy!
            </p>
            <Link
              href="/landlords"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              List Your Property
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                  {property.images.length > 0 ? (
                    <Image
                      src={property.images[0].url}
                      alt={property.images[0].altText || property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-center">
                      <div className="text-4xl mb-2">🏠</div>
                      <p>No image available</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {property.address}, {property.suburb}, {property.state} {property.postcode}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      {property.parking && <span>{property.parking} car</span>}
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      ${(property.rentAmount / 100).toLocaleString()}/month
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 capitalize">
                      {property.propertyType.toLowerCase()}
                    </span>
                    <Link
                      href={`/properties/${property.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
    </>
  )
}
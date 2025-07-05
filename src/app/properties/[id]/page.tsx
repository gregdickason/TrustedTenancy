import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

interface PropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const property = await db.property.findUnique({
    where: { id },
    include: {
      images: true,
      landlord: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  }) as any // TODO: Fix this with proper Prisma types

  if (!property) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/properties"
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              ← Back to Properties
            </Link>
            <div className="text-sm text-gray-500">
              Property ID: {property.id}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64 bg-gray-200 flex items-center justify-center">
              {property.images.length > 0 ? (
                <Image
                  src={property.images[0].url}
                  alt={property.images[0].altText || property.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <p>No images available</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <div className="text-2xl font-bold text-blue-600">
                  ${(property.rentAmount / 100).toLocaleString()}/month
                </div>
              </div>

              <div className="text-gray-600 mb-6">
                <div className="text-lg mb-2">
                  {property.address}
                </div>
                <div className="text-lg">
                  {property.suburb}, {property.state} {property.postcode}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {property.bedrooms}
                  </div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {property.bathrooms}
                  </div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {property.parking || 0}
                  </div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 capitalize">
                    {property.propertyType.toLowerCase()}
                  </div>
                  <div className="text-sm text-gray-600">Type</div>
                </div>
              </div>

              {property.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {property.features && property.features.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Features
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.features.map((feature: string) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <span className="text-green-500">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Contact Information
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-600 mb-2">
                    <span className="font-medium">Landlord:</span>{' '}
                    {property.landlord.name || 'N/A'}
                  </div>
                  <div className="text-gray-600 mb-4">
                    <span className="font-medium">Email:</span>{' '}
                    {property.landlord.email}
                  </div>
                  <InquiryForm propertyId={property.id} landlordEmail={property.landlord.email} propertyTitle={property.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}

function InquiryForm({ landlordEmail, propertyTitle }: { propertyId: string, landlordEmail: string, propertyTitle: string }) {
  return (
    <div className="border-t pt-4">
      <h3 className="font-medium text-gray-900 mb-3">
        Interested in this property?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Contact the landlord directly via email above, or sign in to send an inquiry through our platform.
      </p>
      <div className="flex gap-3">
        <Link
          href="/auth/signin"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In to Inquire
        </Link>
        <a
          href={`mailto:${landlordEmail}?subject=Inquiry about ${propertyTitle}`}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Email Directly
        </a>
      </div>
    </div>
  )
}
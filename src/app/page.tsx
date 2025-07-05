import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logos/TrustedTenancy_800h.png"
              alt="TrustedTenancy Logo"
              width={400}
              height={200}
              priority
              className="h-16 w-auto sm:h-20"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            TrustedTenancy
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Australia&apos;s premier AI-powered property management platform. 
            Streamline your rental property management with smart automation and compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              href="/landlords"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              For Tenants
            </h3>
            <p className="text-gray-600 mb-4">
              Discover quality rental properties with verified landlords. Easy application process and transparent communication.
            </p>
            <Link
              href="/properties"
              className="text-blue-600 font-medium hover:underline"
            >
              Search Properties →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              For Landlords
            </h3>
            <p className="text-gray-600 mb-4">
              Manage your rental properties with AI-powered automation. Tenant screening, rent collection, and compliance made easy.
            </p>
            <Link
              href="/landlords"
              className="text-blue-600 font-medium hover:underline"
            >
              Get Started →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Australian Compliant
            </h3>
            <p className="text-gray-600 mb-4">
              Built specifically for Australian rental laws with automatic compliance across all states and territories.
            </p>
            <Link
              href="/about"
              className="text-blue-600 font-medium hover:underline"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logos/TrustedTenancy_400_h.png"
              alt="TrustedTenancy"
              width={200}
              height={50}
              className="h-8 w-auto"
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/properties" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Properties
            </Link>
            <Link 
              href="/landlords" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              List Property
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/landlords"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
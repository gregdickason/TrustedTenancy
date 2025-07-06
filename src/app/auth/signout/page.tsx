'use client'

import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

export default function SignOutPage() {
  const { data: session, status } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // If user is not signed in, redirect to home
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logos/TrustedTenancy_400_h.png"
              alt="TrustedTenancy"
              width={250}
              height={62}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign out of TrustedTenancy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Are you sure you want to sign out?
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {session?.user && (
              <div className="mb-6 flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSigningOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing out...
                  </>
                ) : (
                  'Yes, sign me out'
                )}
              </button>

              <Link
                href="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </Link>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 text-center">
                You&apos;ll need to sign in again to access your account and manage properties.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
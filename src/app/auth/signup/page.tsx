'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

function SignUpContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isConfigured, setIsConfigured] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  // Check if Google OAuth is configured
  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const response = await fetch('/api/auth/providers')
        const providers = await response.json()
        const hasGoogle = Object.keys(providers).includes('google')
        setIsConfigured(hasGoogle)
        
        if (!hasGoogle) {
          setError('Google OAuth is not configured. Please contact the administrator.')
        }
      } catch (error) {
        console.error('Failed to check auth providers:', error)
        setError('Unable to verify authentication configuration.')
      }
    }
    checkConfiguration()
  }, [])

  // Check if user is already signed in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    }
    checkSession()
  }, [router, callbackUrl])

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      console.log('Starting Google sign-up process...', {
        callbackUrl,
        timestamp: new Date().toISOString()
      })
      
      const result = await signIn('google', {
        callbackUrl,
        redirect: false
      })
      
      console.log('Google sign-up result:', {
        result,
        timestamp: new Date().toISOString()
      })
      
      if (result?.error) {
        console.error('Google sign-up error:', result.error)
        setError(`Failed to create account with Google: ${result.error}`)
        
        // Log to server as well
        fetch('/api/log-client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'AUTH_SIGNUP_ERROR',
            error: result.error,
            url: result.url,
            callbackUrl,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error)
      } else if (result?.url) {
        console.log('Redirecting to:', result.url)
        router.push(result.url)
      } else {
        console.warn('Unexpected result from signIn:', result)
        setError('Sign-up completed but no redirect URL received.')
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-up:', error)
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Log to server as well
      fetch('/api/log-client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'AUTH_SIGNUP_EXCEPTION',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          callbackUrl,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error)
    } finally {
      setIsLoading(false)
    }
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
            Join TrustedTenancy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account to start managing properties
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">
                      Sign-up Error
                    </h3>
                    <div className="mt-1 text-sm">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {!isConfigured ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Configuration Required
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        Google OAuth authentication is not configured. Please see{' '}
                        <Link href="/setup-oauth" className="underline font-medium">
                          setup instructions
                        </Link>{' '}
                        or contact the administrator.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Quick & Secure Registration
                      </h3>
                      <div className="mt-1 text-sm text-blue-700">
                        Sign up with Google to get started instantly. No password required!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGoogleSignUp}
                disabled={isLoading || !isConfigured}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/auth/signin"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in to your account
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  What you get with TrustedTenancy:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    List unlimited properties
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Connect with quality tenants
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    AI-powered property insights
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Australian compliance built-in
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="text-sm text-gray-600">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
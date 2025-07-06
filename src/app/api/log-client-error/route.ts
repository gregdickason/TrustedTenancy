import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, error, stack, url, callbackUrl, timestamp } = body
    
    // Log the client-side error to our logging system
    logger.auth('ERROR', `Client-side error: ${type}`, {
      type,
      error,
      stack,
      url,
      callbackUrl,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to log client error', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
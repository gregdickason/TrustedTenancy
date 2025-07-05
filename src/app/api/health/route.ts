import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check database health
    const isHealthy = await db.healthCheck()
    
    // Get basic database stats
    let stats = null
    if (isHealthy) {
      try {
        const [userCount, propertyCount] = await Promise.all([
          db.user.count(),
          db.property.count()
        ])
        stats = {
          users: userCount,
          properties: propertyCount,
          connection_id: (db.$ as any).__connectionId || 'unknown'
        }
      } catch (error) {
        console.error('Error getting database stats:', error)
      }
    }
    
    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: isHealthy,
        stats
      },
      environment: process.env.NODE_ENV,
    }
    
    return NextResponse.json(response, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false,
        stats: null
      },
      environment: process.env.NODE_ENV,
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
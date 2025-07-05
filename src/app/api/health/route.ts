import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive database status
    const dbStatus = await db.getStatus()
    
    // Get basic database stats if healthy
    let stats = null
    if (dbStatus.healthy) {
      try {
        const [userCount, propertyCount] = await Promise.all([
          db.$.user.count(),
          db.$.property.count()
        ])
        stats = {
          users: userCount,
          properties: propertyCount,
          connection_id: dbStatus.connectionId
        }
      } catch (error) {
        console.error('Error getting database stats:', error)
      }
    }
    
    const response = {
      status: dbStatus.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbStatus.healthy,
        circuit_breaker: dbStatus.circuitBreaker,
        stats
      },
      environment: process.env.NODE_ENV,
    }
    
    return NextResponse.json(response, { 
      status: dbStatus.healthy ? 200 : 503,
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
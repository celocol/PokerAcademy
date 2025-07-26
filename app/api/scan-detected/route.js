import { NextResponse } from 'next/server'

// Store the last scan time in memory (will reset on server restart)
let lastScanTime = null

export async function POST(request) {
  try {
    const { sessionId } = await request.json()
    
    // Update the last scan time
    lastScanTime = new Date()
    
    console.log(`📱 QR scanned! Session: ${sessionId} at ${lastScanTime.toISOString()}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scan detected',
      scanTime: lastScanTime.toISOString(),
      sessionId 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Error detecting scan:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
}

export async function GET() {
  try {
    return NextResponse.json({ 
      lastScanTime: lastScanTime?.toISOString() || null 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Error in GET /api/scan-detected:', error)
    return NextResponse.json({ 
      lastScanTime: null,
      error: error.message 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
} 
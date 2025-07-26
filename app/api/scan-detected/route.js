import { NextResponse } from 'next/server'

// Store the last scan time
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
    })
  } catch (error) {
    console.error('Error detecting scan:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    lastScanTime: lastScanTime?.toISOString() || null 
  })
} 
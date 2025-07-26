import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Poker Academy API is running',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  })
}

export async function POST() {
  return NextResponse.json({
    message: 'POST method not allowed on root API',
    timestamp: new Date().toISOString()
  }, { status: 405 })
} 
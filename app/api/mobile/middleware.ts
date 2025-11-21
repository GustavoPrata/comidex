import { NextResponse } from 'next/server'

export function corsHeaders(response: NextResponse) {
  // Add CORS headers for cross-origin requests
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

export function createCorsResponse(data: any) {
  const response = NextResponse.json(data)
  return corsHeaders(response)
}

export function handleOptions() {
  const response = new NextResponse(null, { status: 200 })
  return corsHeaders(response)
}
import { JWT } from "@/lib/JWT"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is undefined')
}

const jwt = new JWT({ jwtSecret: JWT_SECRET })

export async function POST(request: NextRequest) {
  if (!jwt.verifyAuthTokenFromHeader(request.headers.get('authorization'), 'WebSocketEvent')) {
    return new Response('Invalid token', {
      status: 403,
    })
  }

  console.log({ post: request.url, body: await request.json() })

  return NextResponse.json({ post: request.url, body: request.body })
}

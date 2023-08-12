import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log({ post: request.url })
  return NextResponse.json({ post: request.url })
}

export async function POST(request: NextRequest) {
  console.log({ post: request.url, body: request.body })
  return NextResponse.json({ post: request.url, body: request.body })
}

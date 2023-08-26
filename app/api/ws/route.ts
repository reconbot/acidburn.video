import { JWT } from "@/lib/JWT"
import { NextRequest } from "next/server"
import { assertUnreachable } from "@/lib/utils"
import { WSPublisher } from "../../../lib/WSPublisher"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is undefined')
}

const { 'acidburn-video-production': { controlApi } } = require('../../../cdk/cdk-outputs.json')

const jwt = new JWT({ jwtSecret: JWT_SECRET })

const wsPublisher = new WSPublisher({ controlApi, jwt })

export async function POST(request: NextRequest) {
  const connection = await wsPublisher.parseRequest(request)
  if (!connection) {
    return new Response('Invalid token', {
      status: 403,
    })
  }

  console.log({ connectionId: connection.connectionId, events: connection.inEvents })

  for (const event of connection.inEvents) {
    if (event.type === 'OPEN') {
      connection.accept()
      connection.subscribe('idk')
      continue
    }
    if (event.type ==='CLOSE') {
      continue
    }

    if (event.type === 'TEXT') {
      await wsPublisher.publish('idk', 'I love data')
      continue
    }

    assertUnreachable(event)
  }


  return connection.endResponse()
}

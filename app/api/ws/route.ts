import { JWT } from "@/lib/JWT"
import { ControlPlaneEvent, FromBackend, FromWebSocketServer } from "@/lib/types"
import { NextRequest } from "next/server"
import { parseWebSocketEvents } from '@/lib/parseWebSocketEvents'
import { assertUnreachable } from "@/lib/utils"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is undefined')
}

const { 'acidburn-video-production': { controlApi } } = require('../../../cdk/cdk-outputs.json')

const jwt = new JWT({ jwtSecret: JWT_SECRET })

class WSPublisher {
  controlApi: string
  jwt: JWT

  constructor({ controlApi, jwt }: {controlApi: string, jwt: JWT }) {
    this.controlApi = controlApi
    this.jwt = jwt
  }

  async parseRequest(request: NextRequest): Promise<WSConnection | null> {
    if (!jwt.verifyAuthTokenFromHeader(request.headers.get('authorization'), 'WebSocketEvent')) {
      console.log('bad token')
      return null
    }
    const connectionId = request.headers.get('x-connection-id')
    if (!connectionId) {
      console.log('no connection id')
      return null
    }
    const events = parseWebSocketEvents(await request.text())
    if (!events) {
      console.log('cannot parse events')
      return null
    }
    return new WSConnection(connectionId, events)
  }

  async publish(target: string, data: string) {
    const event: ControlPlaneEvent = { target, event: {type: "TEXT", data }}
    const token = this.jwt.generateToken({ audience: 'ControlEvent', expiresIn: '1m' })
    const response = await fetch(this.controlApi, {
      method: 'POST',
      body: JSON.stringify([event]),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/websocket-events',
      }
    })
    if (!response.ok) {
      const text = await response.text()
      const { status, statusText } = response
      console.error({ target, data, token, status, statusText, text, body: JSON.stringify([event]), controlApi: this.controlApi })
      throw new Error(response.statusText)
    }
  }
}

class WSConnection {
  connectionId: string
  inEvents: FromWebSocketServer[]
  outEvents: FromBackend[]
  accepted: boolean
  closed: boolean

  constructor(connectionId: string, events: FromWebSocketServer[]) {
    this.connectionId = connectionId
    this.inEvents = events
    this.outEvents = []
    this.accepted = false
    this.closed = false
  }

  isOpening() {
    return this.inEvents.length > 0 && this.inEvents[0].type === 'OPEN'
  }

  accept() {
      this.accepted = true
  }

  close() {
    this.closed = true
  }

  // send(message: string) {
  //   this.outEvents.push({ type: "TEXT", data: message })
  // }

  subscribe(channel: string) {
    this.outEvents.push({ type: "SUBSCRIBE", target: channel })
  }

  unsubscribe(channel: string) {
    this.outEvents.push({ type: "UNSUBSCRIBE", target: channel })
  }

  endResponse(): Response {
    let events: FromBackend[] = [...this.outEvents]
    if (this.accepted) {
      events.unshift({ type: "ACCEPT" })
    }

    if (this.closed) {
      events.push({ type: 'DISCONNECT' })
    }
    console.log({outEvents: events})
    return new Response(JSON.stringify(events), {
      status: 200
    })
  }
}

const wsPublisher = new WSPublisher({ controlApi, jwt })

export async function POST(request: NextRequest) {
  const context = await wsPublisher.parseRequest(request)
  if (!context) {
    return new Response('Invalid token', {
      status: 403,
    })
  }

  console.log({ connectionId: context.connectionId, events: context.inEvents })

  for (const event of context.inEvents) {
    if (event.type === 'OPEN') {
      context.accept()
      context.subscribe('idk')
      continue
    }
    if (event.type ==='CLOSE') {
      continue
    }

    if (event.type === 'TEXT') {
      console.log({ received: event })
      await wsPublisher.publish('idk', 'I love data')
      continue
    }

    assertUnreachable(event)
  }


  return context.endResponse()
}

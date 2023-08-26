import { JWT } from "@/lib/JWT"
import { ControlPlaneEvent, FromBackend, FromWebSocketServer } from "@/lib/types"
import { NextRequest } from "next/server"
import { parseWebSocketEvents } from '@/lib/parseWebSocketEvents'

export class WSPublisher {
  controlApi: string
  jwt: JWT

  constructor({ controlApi, jwt }: { controlApi: string, jwt: JWT }) {
    this.controlApi = controlApi
    this.jwt = jwt
  }

  async parseRequest(request: NextRequest): Promise<WSConnection | null> {
    if (!this.jwt.verifyAuthTokenFromHeader(request.headers.get('authorization'), 'WebSocketEvent')) {
      console.error('bad token')
      return null
    }
    const connectionId = request.headers.get('x-connection-id')
    if (!connectionId) {
      console.error('no connection id')
      return null
    }
    const events = parseWebSocketEvents(await request.text())
    if (!events) {
      console.error('cannot parse events')
      return null
    }
    return new WSConnection(connectionId, events)
  }

  async publish(target: string, data: string) {
    const event: ControlPlaneEvent = { target, event: { type: "TEXT", data } }
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
    return new Response(JSON.stringify(events), {
      status: 200
    })
  }
}

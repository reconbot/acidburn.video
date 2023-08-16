export interface Connection {
  connectionId: string
  channelId: string
  senderId: string
  ttl: number
}

export type IncomingMessages = { type: "join", channelId: string } | { type: "publish", data: any } | { type: "ping", data?: any }
export type OutgoingMessages = { type: "message", senderId: string, data: any } | { type: "pong", data?: any } | { type: "joinSuccess" } | { type: "joinFailure" } | { type: "publishFailure", data: string } | { type: "publishSuccess" }

export type WebSocketCommands = ['send', string, Record<string, any>] | ['disconnect', string]

import { APIGatewayProxyHandlerV2 } from "aws-lambda"
import { WebSocketClient } from "./WebSocketClient"
import { WebSocketCommands } from "./types"
import { JWT } from "../../lib/JWT"

const CALLBACK_URL = process.env.CALLBACK_URL
if (!CALLBACK_URL) {
  throw new Error('CALLBACK_URL is undefined')
}

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is undefined')
}

const jwt = new JWT({ jwtSecret: JWT_SECRET })
const wsClient = new WebSocketClient(CALLBACK_URL)

function parseBody(body: string | undefined): WebSocketCommands | null{
  let data
  try {
    data = JSON.parse(body ?? "")
  } catch (error) {
    return null
  }
  if (!Array.isArray(data)) {
    return null
  }
  if (data[0] === 'send' && typeof data[1] === 'string' && typeof data[2] === 'object') {
    return data as WebSocketCommands
  }

  if (data[0] === 'disconnect' && typeof data[1] === 'string') {
    return data as WebSocketCommands
  }

  return null
}
const buildSuccessResponse = () => ({ statusCode: 200 })

const buildErrorResponse = (command: WebSocketCommands) => (err: any) => {
  console.error({ message: 'Error During Send', command, err })
  if (err?.['$metadata']?.httpStatusCode) {
    return {
      statusCode: err?.['$metadata']?.httpStatusCode,
      body: `{ "message": "${err?.name}: ${err?.message}" }`,
    }
  }
  throw err
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!jwt.verifyAuthTokenFromHeader(event.headers.authorization || event.headers.Authorization, 'ControlEvent')) {
    return {
      statusCode: 403,
      body: 'Invalid token',
    }
  }
  const { body } = event
  const command = parseBody(body)
  console.log({command})
  if (!command) {
    return {
      statusCode: 400,
      body: `{"message": "invalid command"}`
    }
  }

  if (command[0] === 'send') {
    return await wsClient.send(command[1], command[2]).then(buildSuccessResponse, buildErrorResponse(command))
  }
  if (command[0] === 'disconnect') {
    return await wsClient.disconnect(command[1]).then(buildSuccessResponse, buildErrorResponse(command))
  }

  return {
    statusCode: 500,
    body: `{"message": "unknown command"}`
  }
}

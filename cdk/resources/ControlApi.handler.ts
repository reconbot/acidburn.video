import { APIGatewayProxyHandlerV2 } from "aws-lambda"
import { WebSocketClient } from "./WebSocketClient"
import { parseControlPlaneCommands, processCommand } from "./commands"
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

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!jwt.verifyAuthTokenFromHeader(event.headers.authorization || event.headers.Authorization, 'ControlEvent')) {
    return {
      statusCode: 403,
      body: 'Invalid token',
    }
  }
  const { body } = event
  const commands = parseControlPlaneCommands(body)
  console.log({ commands })
  if (!commands) {
    return {
      statusCode: 400,
      body: `{"message": "invalid commands"}`
    }
  }

  for (const command of commands) {
    await processCommand(wsClient, command)
  }

  return {
    statusCode: 500,
    body: `{"message": "unknown command"}`
  }
}

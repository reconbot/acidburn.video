import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda"
import { JWT } from "../../lib/JWT"

const TARGET_URL = process.env.TARGET_URL
if (!TARGET_URL) {
  throw new Error('TARGET_URL is undefined')
}

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is undefined')
}
const jwt = new JWT({ jwtSecret: JWT_SECRET })

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { eventType, connectionId } = event.requestContext
  const { body } = event
  const token = jwt.generateToken({ audience: 'WebSocketEvent', expiresIn: '1m' })
  const response = await fetch(TARGET_URL, {
    method: 'POST',
    body: JSON.stringify({ eventType, connectionId, body }),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    console.error({ message: `Bad response from TARGET_URL`, statusCode: response.status, statusText: response.statusText, body: await response.text()})
    return {
      statusCode: 500,
      body: 'Unhandled message'
    }
  }

  const data = await response.json().catch(() => null)
  if (data?.statusCode) {
    const { statusCode, body } = data
    return { statusCode, body }
  }

  return { statusCode: 200 }
}

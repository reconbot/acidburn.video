import { FromBackend, FromWebSocketServer } from "./types";


export function parseWebSocketEvents(body: string | undefined): FromWebSocketServer[] | null {
  if (!body) {
    console.log('no body')
    return null;
  }
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    console.log('cannot json parse')
    return null;
  }
  if (!Array.isArray(data)) {
    console.log('is not array')
    return null;
  }

  for (const event of data as FromBackend[]) {
    if (event.type === 'TEXT' && typeof event.data === 'string') {
      continue;
    }
    if (event.type === 'DISCONNECT') {
      continue;
    }
    if (event.type === 'SUBSCRIBE' && event.target) {
      continue;
    }
    if (event.type === 'UNSUBSCRIBE' && event.target) {
      continue;
    }
    console.log('unknown event', event)
    return null;
  }
  console.log({data})
  return data as FromWebSocketServer[];
}

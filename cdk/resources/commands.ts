import { ControlPlaneEvent, FromBackend, FromWebSocketServer } from "../../lib/types";
import { assertUnreachable } from "../../lib/utils";
import { WebSocketClient, ignoreDisconnected } from "./WebSocketClient";

export function parseControlPlaneCommands(body: string | undefined): ControlPlaneEvent[] | null {
  if (!body) {
    return null;
  }
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    return null;
  }
  if (!Array.isArray(data)) {
    return null;
  }

  for (const command of data as ControlPlaneEvent[]) {
    const { target, event } = command;
    if (!target) {
      return null;
    }
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
    return null;
  }

  return data as ControlPlaneEvent[];
}

export function parseBackendEvents(body: string | undefined): FromBackend[] | null {
  if (!body) {
    return null;
  }
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    return null;
  }
  if (!Array.isArray(data)) {
    return null;
  }

  for (const event of data as FromBackend[]) {
    if (event.type === 'ACCEPT') {
      continue;
    }
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

    return null;
  }

  return data as FromBackend[];
}

export function parseWebSocketEvents(body: string | undefined): FromWebSocketServer[] | null {
  if (!body) {
    return null;
  }
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    return null;
  }
  if (!Array.isArray(data)) {
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

    return null;
  }

  return data as FromWebSocketServer[];
}

export const processCommand = async (wsClient: WebSocketClient, command: ControlPlaneEvent) => {
  const { target, event } = command
  if (event.type === 'TEXT') {
    await wsClient.send(target, event.data).catch(ignoreDisconnected)
    return
  }
  if (event.type === 'DISCONNECT') {
    await wsClient.disconnect(target).catch(ignoreDisconnected)
    return
  }
  if (event.type === 'SUBSCRIBE') {
    return
  }
  if (event.type === 'UNSUBSCRIBE') {
    return
  }
  assertUnreachable(event)
}

import { Action } from "redux";

export interface StandardAction extends Action {
  payload: any
}

interface Message {
  text: string
  id: any
}

interface ChatState {
  messages: Message[]
}

const INITIAL_STATE: ChatState = {
  messages: [],
}

export const chat = (state: ChatState = INITIAL_STATE, action: StandardAction): ChatState => {
  const { type, payload } = action
  switch (type) {
    case 'MESSAGE_RECIEVED':
      return { ...state, messages: [...state.messages, payload] }
    default:
      return state
  }
}

import { Action } from "redux";
import IPFS from 'ipfs'

function makeIPFS() {
  return new IPFS({
    relay: {
      enabled: true,
      hop: {
        enabled: true
      }
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
        ]
      }
    },
    EXPERIMENTAL: {
      pubsub: true,
      dht: false // crashes when turned on
    }
  })
}

export interface StandardAction extends Action {
  payload: any
}

interface IPFSState {
  hash: string | null
  ready: boolean
  ipfs: any
  uploadingFile: null | { name: string, progress: number, size: number }
  error: null | Error
}

const INITIAL_STATE: IPFSState = {
  hash: null,
  ipfs: makeIPFS(),
  ready: false,
  uploadingFile: null,
  error: null,
}

export const ipfs = (state: IPFSState | undefined = INITIAL_STATE, action: StandardAction): IPFSState => {
  const { type, payload } = action
  switch (type) {
    case 'WATCH_HASH':
      return { ...state, hash: payload.hash }
    case 'WATCH_ERROR':
      return { ...state, hash: null, error: payload.error }
    case 'IPFS_READY':
      return { ...state, ready: true }
    case 'FILE_SAVE':
      return { ...state, uploadingFile: { name: payload.name, size: payload.size, progress: 0 } }
    case 'FILE_SAVING':
      if (payload.size === payload.uploaded) {
        return { ...state, uploadingFile: null }
      }
      return { ...state, uploadingFile: { ...state.uploadingFile, ...payload } }
    case 'FILE_SAVING_ERROR':
      return { ...state, uploadingFile: null, error: payload.error }
    default:
      return state
  }
}

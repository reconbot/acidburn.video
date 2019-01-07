export interface Actions {
  type: 'IPFS_READY' | 'WATCH_HASH' | 'PIN_HASH_COMPLETE'
  payload?: any
}

const DEFAULT_STATE = {
  hash: undefined,
  pins: [],
  ipfsReady: false
}

export function reducers(state = DEFAULT_STATE, action: Actions) {
  switch (action.type) {
    case 'IPFS_READY':
      return { ...state, ipfsReady: true }
    case 'WATCH_HASH':
      return { ...state, hash: action.payload.hash }
    default:
      console.log('UNKNOWN ACTION', action)
      return state
  }
}

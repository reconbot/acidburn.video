import { delay } from 'redux-saga'
import { put, takeEvery, all, call, take, spawn, fork, actionChannel } from 'redux-saga/effects'
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

function* waitForReady(ipfs: IPFS) {
  yield new Promise(resolve => {
    ipfs.on('ready', resolve)
  })
  yield put({ type: 'IPFS_READY' })
}

export function* pinHash(ipfs: IPFS, event: any) {
  const payload = yield ipfs.pin.add(event.payload.hash)
  yield put({ type: 'PIN_HASH_COMPLETE', payload })
}

export function* unPinHash(ipfs: IPFS, event: any) {
  const payload = yield ipfs.pin.rm(event.payload.hash)
  yield put({ type: 'UNPIN_HASH_COMPLETE', payload })
}

export function* keepTrackOfPins(ipfs: IPFS) {
  const pinChannel = yield actionChannel(['WATCH_HASH', 'PIN_HASH'])
  const unpinChannel = yield actionChannel('UNPIN_HASH')
  yield take('IPFS_READY')
  yield takeEvery(pinChannel, pinHash, ipfs)
  yield takeEvery(unpinChannel, unPinHash, ipfs)
}

export function* ipfsSaga() {
  const ipfs = makeIPFS()
  yield all([
    waitForReady(ipfs),
    keepTrackOfPins(ipfs)
  ])
}

import React, { createContext, useState, useEffect, useReducer, useMemo } from "react"
import IPFS from 'ipfs'

function makeIPFS() {
  console.log('makeIPFS')
  const ipfs = new IPFS({
    relay: { enabled: true, hop: { enabled: true } },
    config: {
      Addresses: {
        Swarm: [ '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star' ]
      }
    },
    EXPERIMENTAL: {
      pubsub: true,
      dht: false
    }
  })
  return ipfs
}

export const IPFSContext = createContext<{ ipfs: any; ipfsDispatch: any}>({ ipfs: null, ipfsDispatch: null})

function reducer(state, action) {
  switch(action.type) {
    case 'init': return { ... state, ipfs: action.ipfs }
    case 'ready': return { ...state, ready: true }
  }
  return state
}

export function IPFSProvider (props) {
  const [ipfs, ipfsDispatch] = useReducer(reducer, {
    ipfs: null,
    ready: false,
    pins: []
  })

  useEffect(() => {
    const ipfs = makeIPFS()
    ipfsDispatch({ type: 'init', ipfs })
    const dispatchReady = () => ipfsDispatch({ type: 'ready' })
    ipfs.once('ready', dispatchReady )

    return () => {
      ipfs.removeListener('ready', dispatchReady)
      ipfs.stop()
    }
  }, [])

  const context = useMemo(() => {
    return { ipfs, ipfsDispatch}
  }, [ipfs])

  return (<IPFSContext.Provider value={context as any}>
    {props.children}
  </IPFSContext.Provider>)
}

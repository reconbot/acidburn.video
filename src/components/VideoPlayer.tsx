import React, { useContext } from 'react'
import './VideoPlayer.css'
import { IPFSContext } from './IPFSProvider'
import { RouterContext } from './Router'
import { VideoElement } from './VideoElement'
import { FileUploader } from './FileUploader'

export function VideoPlayer() {
  const { ipfs } = useContext(IPFSContext)
  const { route, setRoute } = useContext(RouterContext)
  const hashes = [
    'QmVHf8QNSoT4xkn3JXLkXKqw5WhivPeQeHGskP1jH5nkHe',
    'QmRBQ7Bzo3PcU5a6iTagDmH5vNzV1Tj3wey9FcccJZRukN'
  ]

  const watchNeat = () => setRoute(hashes[0])
  const watchCool = () => setRoute(hashes[1])
  const stopWatching = () => setRoute()

  if (!ipfs.ready) {
    return (<h1>Connecting to IPFS</h1>)
  }
  return (<>
    <div className="video-player">
      {route
        ? <VideoElement hash={route} />
        : <FileUploader/>
      }
    </div>
    <button onClick={watchNeat}>Watch something neat</button>
    <button onClick={watchCool}>Watch something cool</button>
    <button onClick={stopWatching}>Watch Nothing</button>
  </>)
}

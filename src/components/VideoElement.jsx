import React, { useContext, useRef, useEffect } from 'react'
import VideoStream from 'videostream'
import { IPFSContext } from './IPFSProvider'

export function VideoElement ({ hash } = {}) {
  const videoTag = useRef()
  const { ipfs: { ipfs } } = useContext(IPFSContext)

  useEffect(() => {
    let stream
    const file = {
      createReadStream: (opts) => {
        const start = opts.start

        // The videostream library does not always pass an end byte but when
        // it does, it wants bytes between start & end inclusive.
        // catReadableStream returns the bytes exclusive so increment the end
        // byte if it's been requested
        const end = opts.end ? start + opts.end + 1 : undefined

        console.log(`Stream: Asked for data starting at byte ${start} and ending at byte ${end}`)

        stream = ipfs.files.readReadableStream(`/ipfs/${hash}`, {
          offset: start,
          length: end && end - start
        })
        stream.on('error', err => console.error('stream error', err))

        return stream
      }
    }
    new VideoStream(file, videoTag.current)
    return () => {
      if (stream) {
        console.log('destroying stream!')
        stream.destroy()
      }
    }
  }, [hash])
  return (<video ref={videoTag} controls autoPlay loop />)
}

const Ipfs = require('ipfs')
const VideoStream = require('videostream')
const ipfs = new Ipfs({
  relay: {
    enabled: true,
    hop: {
      enabled: true
    }
  },
  // config: {
  //   Addresses: {
  //     Swarm: [
  //       '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
  //     ]
  //   }
  // },
  EXPERIMENTAL: {
    pubsub: true
  }
})
const {
  dragDrop,
  statusMessages,
  createVideoElement,
  log
} = require('./utils')

log('IPFS: Initialising')

const hashInput = document.getElementById('hash')
const goButton = document.getElementById('gobutton')

class Chat {
  constructor(ipfs) {
    this.ipfs = ipfs
    this.channel = null
    this.me = null
    ipfs.once('ready', () => this.ready())
  }
  async join(channel) {
    this.channel = `chat-${channel}`
    await this.ipfs.pubsub.subscribe(this.channel, event => this.onMessage(event))
    console.log(`Subscribed to channel #${this.channel}`)
  }
  async ready() {
    const { id } = await this.ipfs.id()
    this.id = id
    console.log(`chat online ID:${this.id}`)
    await this.join('acideburn.video')
  }
  async send(data) {
    if (!this.channel) {
      throw new Error('Must join a channel first')
    }
    const message = this.ipfs.types.Buffer.from(JSON.stringify(data))
    await this.ipfs.pubsub.publish(this.channel, message)
  }
  onMessage(event) {
    if (event.from === this.id) {
      return
    }
    try {
      const data = JSON.parse(event.data.toString())
      console.log({ data, event })
    } catch (error) {
      console.error('cannot proceess event')
      console.error(error)
      console.error(event)
    }
  }
}

let chat = new Chat(ipfs)
window.chat = chat

ipfs.once('ready', () => {
  // Allow adding files to IPFS via drag and drop
  dragDrop(ipfs, log)

  log('IPFS: Ready')
  log('IPFS: Drop an .mp4 file into this window to add a file')
  log('IPFS: Then press the "Play!" button to start playing a video')

  hashInput.disabled = false
  goButton.disabled = false
})

const videoElement = createVideoElement()
let stream


function playHash(hash) {
  log(`IPFS: Playing ${hash}`)
  const file = {
    createReadStream(opts) {
      const start = opts.start

      // The videostream library does not always pass an end byte but when
      // it does, it wants bytes between start & end inclusive.
      // catReadableStream returns the bytes exclusive so increment the end
      // byte if it's been requested
      const end = opts.end ? start + opts.end + 1 : undefined

      log(`Stream: Asked for data starting at byte ${start} and ending at byte ${end}`)

      // If we've streamed before, clean up the existing stream
      if (stream && stream.destroy) {
        stream.destroy()
      }

      // This stream will contain the requested bytes
      stream = ipfs.files.readReadableStream(`/ipfs/${hash}`, {
        offset: start,
        length: end && end - start
      })

      // Log error messages
      stream.on('error', (error) => log(error.stack))

      if (start === 0) {
        // Show the user some messages while we wait for the data stream to start
        statusMessages(stream, log)
      }

      return stream
    }
  }
  // Set up the video stream an attach it to our <video> element
  new VideoStream(file, videoElement)
}

goButton.onclick = function (event) {
  event.preventDefault()
  const hash = hashInput.value.trim()
  playHash(hash)
  window.location.hash = `#${hash}`
}

if (window.location.hash) {
  const hash = window.location.hash.slice(1)
  hashInput.value = hash
  ipfs.once('ready', () => playHash(hash))
}

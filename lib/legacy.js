// // files uploaded or pinned
// chat.ipfs.pin.ls({ type: 'recursive' }).then(console.log)


// watching doesn't pin

/* <div id="container" ondrop="dropHandler(event)" ondragover="dragOverHandler(event)">
<div id="form-wrapper">
  <form>
    <input type="text" id="hash" placeholder="Hash" disabled />
    <button id="gobutton" disabled>Watch!</button>
  </form>
  <video id="video" controls></video>
</div>
<pre id="output" style="display: inline-block"></pre>
</div>

OTV - ARPS

Automated
Record
Playback
System


ZEROCOOL / CRASH OVERRIDE
ACID BURN
cyberdelia

Most common used passwords
love
secret
sex
god

</body> */


const Ipfs = require('ipfs')
const VideoStream = require('videostream')

'use strict'

const output = document.getElementById('output')
const log = (line) => {
  let message

  if (line.message) {
    message = `Error: ${line.message.toString()}`
  } else {
    message = line
  }

  if (message) {
    const node = document.createTextNode(`${message}\r\n`)
    output.appendChild(node)

    output.scrollTop = output.offsetHeight

    return node
  }
}

const container = document.querySelector('#container')
const dragDrop = (ipfs) => {

  container.ondragover = (event) => {
    event.preventDefault()
  }

  container.ondrop = (event) => {
    event.preventDefault()

    Array.prototype.slice.call(event.dataTransfer.items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .forEach(file => {
        const progress = log(`IPFS: Adding ${file.name} 0%`)

        const reader = new window.FileReader()
        reader.onload = (event) => {
          ipfs.files.add({
            path: file.name,
            content: ipfs.types.Buffer.from(event.target.result)
          }, {
              progress: (addedBytes) => {
                progress.textContent = `IPFS: Adding ${file.name} ${parseInt((addedBytes / file.size) * 100)}%\r\n`
              }
            }, (error, added) => {
              if (error) {
                return log(error.stack)
              }

              const hash = added[0].hash

              log(`IPFS: Added ${hash}`)

              document.querySelector('#hash').value = hash
            })
        }

        reader.readAsArrayBuffer(file)
      })

    if (event.dataTransfer.items && event.dataTransfer.items.clear) {
      event.dataTransfer.items.clear()
    }

    if (event.dataTransfer.clearData) {
      event.dataTransfer.clearData()
    }
  }
}

const statusMessages = (stream) => {
  let time = 0
  const timeouts = [
    'Stream: Still loading data from IPFS...',
    'Stream: This can take a while depending on content availability',
    'Stream: Hopefully not long now',
    'Stream: *Whistles absentmindedly*',
    'Stream: *Taps foot*',
    'Stream: *Looks at watch*',
    'Stream: *Stares at floor*',
    'Stream: *Checks phone*',
    'Stream: *Stares at ceiling*',
    'Stream: Got anything nice planned for the weekend?'
  ].map(message => {
    time += 5000

    return setTimeout(() => {
      log(message)
    }, time)
  })

  stream.once('data', () => {
    log('Stream: Started receiving data')
    timeouts.forEach(clearTimeout)
  })
  stream.once('error', () => {
    timeouts.forEach(clearTimeout)
  })
}

const createVideoElement = () => {
  const videoElement = document.getElementById('video')
  videoElement.loop = true
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play()
      .catch(log)
  })

  const events = [
    'playing',
    'waiting',
    'seeking',
    'seeked',
    'ended',
    'loadedmetadata',
    'loadeddata',
    'canplay',
    'canplaythrough',
    'durationchange',
    'play',
    'pause',
    'suspend',
    'emptied',
    'stalled',
    'error',
    'abort'
  ]
  events.forEach(event => {
    videoElement.addEventListener(event, () => {
      log(`Video: ${event}`)
    })
  })

  videoElement.addEventListener('error', () => {
    log(videoElement.error.stack)
  })

  return videoElement
}

const ipfs = new Ipfs({
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
  ipfs.pin.add(hash)
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

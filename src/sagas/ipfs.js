import { eventChannel, buffers } from 'redux-saga'
import { put, actionChannel, take, fork, select, cancel, takeEvery } from 'redux-saga/effects'
import { uploadError, uploadProgress, watchHash, ipfsReady, messageError, recieveMessage, sendMessage } from '../actions'

function* waitForReady(ipfs) {
  yield new Promise(resolve => {
    ipfs.on('ready', resolve)
  })
  yield put(ipfsReady())
}

export function* pinHash(ipfs, event) {
  const hash = event.payload.hash
  if (!hash) {
    return
  }
  try {
    const payload = yield ipfs.pin.add(hash)
    yield put({ type: 'PIN_HASH_COMPLETE', payload })
  } catch (error) {
    yield put({ type: 'PIN_HASH_ERROR', error })
  }
}

export function* unPinHash(ipfs, event) {
  const hash = event.payload.hash
  if (!hash) {
    return
  }
  try {
    const payload = yield ipfs.pin.rm(hash)
    yield put({ type: 'UNPIN_HASH_COMPLETE', payload })
  } catch (error) {
    yield put({ type: 'UNPIN_HASH_ERROR', error })
  }
}

export function* uploadFile(ipfs, event) {
  const file = event.payload
  const { name, size } = file
  yield put({ type: 'FILE_SAVING', payload: { name, size, uploaded: 0, progress: 0 } })
  const reader = new FileReader()
  const channel = eventChannel(emit => {
    let uploaded = 0
    const interval = setInterval(() => {
      emit({ value: uploadProgress({ name, size, uploaded }) })
    }, 200)

    const onProgress = { progress: (uploadedNum) => uploaded = uploadedNum }
    reader.onload = (loadEvent) => {
      const ipfsFile = {
        path: file.name,
        content: ipfs.types.Buffer.from(loadEvent.target.result)
      }
      ipfs.add(ipfsFile, onProgress, (error, added) => {
        if (error) {
          emit({ done: true, value: uploadError(error) })
          clearInterval(interval)
          return
        }
        emit({ value: uploadProgress({ name, size, uploaded: size }) })
        const hash = added[0].hash
        clearInterval(interval)
        emit({ done: true, value: watchHash(hash) })
      })
    }
    return () => {
      clearInterval(interval)
      console.error('No way to cancel an upload')
    }
  })
  reader.readAsArrayBuffer(file)
  while (true) {
    const { value, done } = yield take(channel);
    yield put(value)
    if (done) {
      return
    }
  }
}

function* subscribeToChannel(ipfs, channelName) {
  const channel = eventChannel(emit => {
    console.log('subscriber online ' + channelName)
    const messageListener = (event) => {
      try {
        const text = JSON.parse(event.data.toString())
        const value = recieveMessage({
          id: event.seqno.toString('HEX'),
          text,
          from: event.from
        })
        emit({ value })

      } catch (error) {
        console.log(event)
        emit({ error })
      }
    }
    ipfs.pubsub.subscribe(channelName, messageListener, (error) => {
      if (error) {
        emit({ error })
      } else {
        emit({ value: { type: 'CHANNEL_JOINED', payload: { channelName } } })
        const value = sendMessage('Never fear, I is here')
        emit({ value })
      }
    })

    return () => {
      console.log('subscriber canceling ' + channelName)
      // does this wait for the unsub promise?
      return ipfs.pubsub.unsubscribe(channelName, messageListener)
    }
  })
  while (true) {
    console.log('looking for a chat message')
    const { value, error } = yield take(channel)
    if (error) {
      yield put(messageError(error))
      return
    }
    if (value) {
      yield put(value)
    }
  }
}

function* sendToChannel(channel, ipfs, event) {
  const data = ipfs.types.Buffer.from(JSON.stringify(event.payload.message))
  yield ipfs.pubsub.publish(channel, data)
  yield put({ type: 'MESSAGE_SENT', payload: event.payload })
}

function* channelManagement(ipfs) {
  let currentChannel = null
  const buffer = yield actionChannel('WATCH_HASH', buffers.sliding(1))
  yield take('IPFS_READY')
  let subscription
  let sendingThread
  while (true) {
    const event = yield take(buffer)
    const channel = event.payload.hash ? `chat-${event.payload.hash}` : null
    if (channel !== currentChannel) {
      if (subscription) {
        yield cancel(subscription)
        yield cancel(sendingThread)
      }
      currentChannel = channel
      if (channel) {
        sendingThread = yield takeEvery('MESSAGE_SEND', sendToChannel, currentChannel, ipfs)
        subscription = yield fork(subscribeToChannel, ipfs, channel)
      }
    }
  }
}

function* chat(ipfs) {
  yield fork(channelManagement, ipfs)
}

export function* ipfsSaga() {
  const ipfs = yield select(({ ipfs: { ipfs } }) => ipfs)
  const channel = yield actionChannel('*')
  yield fork(chat, ipfs)
  yield fork(waitForReady, ipfs)
  yield take('IPFS_READY')
  while (true) {
    const event = yield take(channel)
    if (event.type === 'WATCH_HASH' || event.type === 'PIN_HASH') {
      yield fork(pinHash, ipfs, event)
    }
    if (event.type === 'UNPIN_HASH') {
      yield fork(unPinHash, ipfs, event)
    }
    if (event.type === 'FILE_SAVE') {
      yield fork(uploadFile, ipfs, event)
    }
  }
}

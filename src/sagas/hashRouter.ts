import { eventChannel } from 'redux-saga'
import { put, take, all, takeEvery } from 'redux-saga/effects'
import { watchHash } from '../actions'

const readHash = () => document.location.hash.slice(1)

export const onHashChange = function* () {
  if (window.location.hash) {
    yield put(watchHash(readHash()))
  }
  const channel = eventChannel(emit => {
    const emitChanges = () => emit(readHash())

    window.addEventListener('hashchange', emitChanges)

    return () => {
      window.removeEventListener('hashchange', emitChanges)
    }
  })
  while (true) {
    const hash = yield take(channel)
    yield put(watchHash(hash))
  }
}

export const onWatch = function* (event) {
  const hash = event.payload.hash
  if (readHash() !== hash) {
    window.history.pushState(null, document.title, document.location.pathname + (hash ? '#' + hash : ''))
  }
}

export const hashRouter = function* () {
  yield all([
    onHashChange(),
    takeEvery('WATCH_HASH', onWatch),
  ])
}

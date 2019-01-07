import { delay } from 'redux-saga'
import { put, takeEvery, all, call, take, spawn, fork } from 'redux-saga/effects'

function* helloSaga(): IterableIterator<void> {
  console.log('Hello Sagas!')
}

// Our worker Saga: will perform the async increment task
export function* incrementAsync() {
  yield call(delay, 1000)
  yield put({ type: 'INCREMENT' })
}

// Our watcher Saga: spawn a new incrementAsync task on each INCREMENT_ASYNC
export function* watchIncrementAsync() {
  while (true) {
    yield take('INCREMENT_ASYNC')
    yield fork(incrementAsync)
  }
  // yield takeEvery('INCREMENT_ASYNC', incrementAsync)
}

export function* rootSaga() {
  yield all([
    helloSaga(),
    watchIncrementAsync()
  ])
}

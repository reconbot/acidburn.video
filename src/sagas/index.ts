import { all } from 'redux-saga/effects'
import { ipfsSaga } from './ipfs'
import { hashRouter } from './hashRouter'

export const rootSaga = function* () {
  yield all([
    ipfsSaga(),
    hashRouter()
  ])
}

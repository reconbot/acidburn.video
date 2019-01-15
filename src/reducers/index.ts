import { combineReducers } from 'redux';
import { ipfs } from './ipfs';
import { chat } from './chat'
export const rootReducer = combineReducers({
  test: (state = true, action) => {
    console.log({ action })
    return state
  },
  ipfs,
  chat,
});

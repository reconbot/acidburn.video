import { combineReducers } from 'redux';
import { ipfs } from './ipfs';
import { chat } from './chat'
export const rootReducer = combineReducers({
  ipfs,
  chat,
});

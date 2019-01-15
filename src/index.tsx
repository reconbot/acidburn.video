import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { App } from './components/App'
import { Provider } from 'react-redux'
import { configureStore } from './store'
import * as serviceWorker from './serviceWorker'
import { watchHash } from './actions'

const store = configureStore()
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()

  // debug
  ; (window as any).store = store
  ; (window as any).ipfs = store.getState().ipfs.ipfs
  ; (window as any).hackers = () => store.dispatch(watchHash('QmZj2Zz2SsuVgWDqCsfCskUk5GeQdE8MtQEFd6twX1gmGB'))

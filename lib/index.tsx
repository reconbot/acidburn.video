import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { Counter } from './counter'
import { reducers, Actions } from './reducers'
import { rootSaga } from './sagas'

const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  reducers,
  applyMiddleware(sagaMiddleware)
)

sagaMiddleware.run(rootSaga)

const action = (type: Actions['type'], payload?: any) => {
  store.dispatch({ type, payload })
}

class App extends Component {
  state = { count: store.getState() }
  constructor(props: any) {
    super(props)
    store.subscribe(() => this.setState({ count: store.getState() }))
  }

  render() {
    return (
      <
      <Counter
        watch={(hash: string) => action('WATCH_HASH', hash)}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'))

  ; (window as any).app = {
    store,
    ReactDOM,
    App,
    el: document.getElementById('app')
  }

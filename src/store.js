import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootReducer } from './reducers';
import { rootSaga } from './sagas'

const composeEnhancers = (false && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

export function configureStore() {
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(sagaMiddleware))
  );
  sagaMiddleware.run(rootSaga)
  return store
}

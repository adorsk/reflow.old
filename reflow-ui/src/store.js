import * as redux from 'redux'
import thunk from 'redux-thunk'

import { rootReducer } from './reducers.js'

const composeEnhancers = (
  (
    (typeof window === 'object') &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  )
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  : redux.compose
)
const enhancer = composeEnhancers(redux.applyMiddleware(thunk))

export default function createStore(initialState) {
  const store = redux.createStore(rootReducer, initialState, enhancer)
  // Hot reload
  if(process.env.NODE_ENV !== 'production') {
    if(module.hot) {
      module.hot.accept('./reducers.js', () =>{
        const newRootReducer = require('./reducers.js').rootReducer
        store.replaceReducer(newRootReducer)
      })
    }
  }
  return store
}

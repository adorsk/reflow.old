import * as redux from 'redux'
import thunk from 'redux-thunk'
import { createReducer } from 'redux-orm'
import _ from 'lodash'

import rootReducer from './reducers.js'
import { orm } from './orm.js'
import actions from './actions.js'
import selectors from './selectors.js'

const composeEnhancers = (
  (
    (typeof window === 'object') &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  )
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  : redux.compose
)

class Store {
  constructor ({initialState = {}}) {
    this.reduxStore = this._createReduxStore({initialState})
    this.actions = this._createBoundActions()
    this.selectors = selectors
  }

  _createReduxStore ({initialState = {}}) {
    const enhancer = composeEnhancers(redux.applyMiddleware(thunk))
    const rootReducer = redux.combineReducers({
      orm: createReducer(orm)
    })
    const initialStateWithOrm = {
      orm: orm.getEmptyState(),
      ...initialState,
    }
    return redux.createStore(rootReducer, initialState, enhancer)
  }

  _createBoundActions () {
    return _.mapValues(actions, (actionCreators) => {
      return bindActionCreators(actionCreators, this.reduxStore.dispatch)
    })
  }

  subscribe (...args) {
    return this.reduxStore.subscribe(...args)
  }
}

export default Store


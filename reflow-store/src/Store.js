import * as redux from 'redux'
import thunk from 'redux-thunk'
import { createReducer } from 'redux-orm'
import _ from 'lodash'

import { orm } from './orm.js'
import actions from './actions.js'
import selectors from './selectors.js'
import * as utils from './utils.js'

const composeEnhancers = (
  (
    (typeof window === 'object') &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  )
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  : redux.compose
)

class Store {
  constructor (opts = {}) {
    const { initialState } = opts
    this.reduxStore = this._createReduxStore({initialState})
    this.actions = this._createBoundActions()
    this.selectors = selectors
    this.utils = utils
  }

  _createReduxStore ({initialState = {}}) {
    const enhancer = composeEnhancers(redux.applyMiddleware(thunk))
    const rootReducer = redux.combineReducers({ orm: createReducer(orm) })
    const initialStateWithOrm = {
      orm: orm.getEmptyState(),
      ...initialState,
    }
    return redux.createStore(rootReducer, initialState, enhancer)
  }

  _createBoundActions () {
    return _.mapValues(actions, (actionCreators) => {
      return redux.bindActionCreators(actionCreators, this.reduxStore.dispatch)
    })
  }

  subscribe (...args) {
    return this.reduxStore.subscribe(...args)
  }

  getDerivedState (opts = {}) {
    return {
      program: this.selectors.derivedProgram(this.getRawState())
    }
  }

  getRawState () {
    return this.reduxStore.getState()
  }
}

export default Store

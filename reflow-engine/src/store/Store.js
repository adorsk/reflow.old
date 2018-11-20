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
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : redux.compose
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
    let versionIdx = 0
    const rootReducer = redux.combineReducers({
      orm: createReducer(orm),
      version: (versionState) => versionState += 1
    })
    const initialStateWithOrm = {
      orm: orm.getEmptyState(),
      version: 0,
      ...initialState,
    }
    return redux.createStore(rootReducer, initialStateWithOrm, enhancer)
  }

  _createBoundActions () {
    return _.mapValues(actions, (actionCreators) => {
      return redux.bindActionCreators(actionCreators, this.reduxStore.dispatch)
    })
  }

  subscribe (...args) {
    return this.reduxStore.subscribe(...args)
  }

  getRawState () {
    return this.reduxStore.getState()
  }

  getProgram () {
    return this.selectors.program(this.getRawState())
  }

  getProcs () {
    return this.selectors.procsWithInputs(this.getRawState())
  }

  getWires () {
    return this.selectors.wires(this.getRawState())
  }
  
  getVersion () {
    return this.getRawState().version
  }

  getInputsByProcId () {
    return this.selectors.inputsByProcId(this.getRawState())
  }
}

export default Store

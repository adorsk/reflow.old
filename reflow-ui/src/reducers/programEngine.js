import { actionTypes } from '../actions/programEngine.js'

export const programEngineReducer = (state = {}, action) => {
  const { type, payload } = action
  if (type === actionTypes.setEngine) {
    if (state.engine && state.engine.destroy) { state.engine.destroy() }
    state = {
      ...state,
      engine: payload.engine
    }
  }
  else if (type === actionTypes.setVersion) {
    state = {
      ...state,
      version: payload.version
    }
  }
  return state
}

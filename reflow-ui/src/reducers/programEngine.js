import { actionTypes } from '../action/programEngine.js'

export const programEngineReducer = (state = {}, action) => {
  const { type, payload } = action
  if (type === actionTypes.setEngine) {
    state = {
      ...state,
      engine: payload.programEngine
    }
  }
  else if (type === actionTypes.programEngine.setVersion) {
    state = {
      ...state,
      version: payload.version
    }
  }
  return state
}

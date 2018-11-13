import { actionTypes } from './actions.js'

const initialState = {
  programEngine: null,
  engineState: {},
  procUiStates: {},
  procWidgetStates: {},
}

export const rootReducer = (state = initialState, action) => {
  const { type, payload } = action
  if (type === actionTypes.setProgramEngine) {
    state = {
      ...state,
      programEngine: payload.programEngine
    }
  }
  else if (type === actionTypes.setEngineState) {
    state = {
      ...state,
      engineState: payload.engineState
    }
  }
  else if (type === actionTypes.updateProcUiState) {
    const { procId, updates } = payload
    state = {
      ...state,
      procUiStates: {
        ...state.procUiStates,
        [procId]: Object.assign({}, state.procUiStates[procId], updates)
      }
    }
  }
  else if (type === actionTypes.updateProcWidgetState) {
    const { procId, updates } = payload
    state = {
      ...state,
      procWidgetStates: {
        ...state.procWidgetStates,
        [procId]: Object.assign({}, state.procWidgetStates[procId], updates)
      }
    }
  }
  return state
}

export default rootReducer

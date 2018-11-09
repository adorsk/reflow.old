import { actionTypes } from './actions.js'

const initialState = {
  engineProgram: null,
  engineState: {},
  procUiStates: {},
}

export const rootReducer = (state = initialState, action) => {
  const { type, payload } = action
  if (type === actionTypes.setEngineProgram) {
    state = {
      ...state,
      engineProgram: payload.engineProgram
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
  return state
}

export default rootReducer

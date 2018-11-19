import _ from 'lodash'
import { actionTypes } from '../actions/programEditor.js'

export const programEditorReducer = (state = {}, action) => {
  const { type, payload } = action
  if (type === actionTypes.updateProcFrameState) {
    const { procId, updates } = payload
    state = {
      ...state,
      procFrameStates: {
        ...state.procFrameStates,
        [procId]: {
          ...(_.get(state, ['procFrameStates', procId], {})),
          ...updates
        }
      }
    }
  }
  else if (type === actionTypes.updateProcWidgetState) {
    const { procId, updates } = payload
    state = {
      ...state,
      procWidgetStates: {
        ...state.procWidgetStates,
        [procId]: {
          ...(_.get(state, ['procWidgetStates', procId], {})),
          ...updates
        }
      }
    }
  }
  return state
}

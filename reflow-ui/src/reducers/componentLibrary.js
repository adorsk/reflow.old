import ComponentLibrary from 'reflow-engine/src/ComponentLibrary.js'
import { actionTypes } from '../actions/componentLibrary.js'

const initialState = {
  componentLibrary: new ComponentLibrary(),
  version: 0,
}

export const componentLibraryReducer = (state = initialState, action) => {
  const { type, payload } = action
  if (type === actionTypes.updateComponentLibrary) {
    const { updates } = payload
    state.componentLibrary.update({updates})
  }
  state = {...state, version: state.version + 1}
  return state
}

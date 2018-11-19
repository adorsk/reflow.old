import { actionTypes } from '../actions/componentLibrary.js'

export const componentLibraryReducer = (state = {}, action) => {
  const { type, payload } = action
  if (type === actionTypes.updateComponentLibrary) {
    const { updates } = payload
    state = {...state, ...updates}
  }
  return state
}

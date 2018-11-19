import { combineReducers } from 'redux'

import { componentLibraryReducer } from './componentLibraryReducer.js'
import { programEditorReducer } from './programEditorReducer.js'
import { programEngineReducer } from './programEngineReducer.js'

export const rootReducer = combineReducers({
  componentLibrary: componentLibraryReducer,
  programEditor: programEditorReducer,
  programEngine: programEngineReducer,
})

export default rootReducer

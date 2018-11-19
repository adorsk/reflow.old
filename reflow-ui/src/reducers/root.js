import { combineReducers } from 'redux'

import { componentLibraryReducer } from './componentLibrary.js'
import { programEditorReducer } from './programEditor.js'
import { programEngineReducer } from './programEngine.js'

export const rootReducer = combineReducers({
  componentLibrary: componentLibraryReducer,
  programEditor: programEditorReducer,
  programEngine: programEngineReducer,
})

export default rootReducer

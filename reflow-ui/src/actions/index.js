import programEngineActions from './programEngine.js'
import programEditorActions from './programEditor.js'
import componentLibraryActions from './componentLibrary.js'

export const actionTypes = {
  programEngine: programEngineActions.actionTypes,
  programEditor: programEditorActions.actionTypes,
  componentLibrary: componentLibraryActions.actionTypes,
}

export const actionCreators = {
  programEngine: programEngineActions.actionCreators,
  programEditor: programEditorActions.actionCreators,
  componentLibrary: componentLibraryActions.actionCreators,
}

export default { actionTypes, actionCreators }

export const actionTypes = {
  setProgramEngine: 'setProgramEngine',
  setEngineState: 'setEngineState',
  updateProcUiState: 'updateProcUiState',
  updateProcWidgetState: 'updateProcWidgetState',
  updateComponentLibrary: 'updateComponentLibrary',
}

export const actionCreators = {}
actionCreators.setProgramEngine = ({programEngine}) => ({
  type: actionTypes.setProgramEngine,
  payload: {programEngine}
})
actionCreators.setEngineState = ({engineState}) => ({
  type: actionTypes.setEngineState,
  payload: {engineState}
})
actionCreators.updateProcUiState = ({procId, updates}) => ({
  type: actionTypes.updateProcUiState,
  payload: {procId, updates}
})
actionCreators.updateProcWidgetState = ({procId, updates}) => ({
  type: actionTypes.updateProcWidgetState,
  payload: {procId, updates}
})
actionCreators.updateComponentLibrary = ({updates}) => ({
  type: actionTypes.updateComponentLibrary,
  payload: { updates }
})
actionCreators.loadComponentLibrary = () => {
  return async (dispatch) => {
    const libraryModule = await import('./reflowComponents/library.js')
    dispatch(actionCreators.updateComponentLibrary({
      updates: { components: libraryModule.components }
    }))
  }
}

actionCreators.updateProcOutputs = ({procId, updates}) => {
  return (dispatch, getState) => {
    const programEngine = getState().programEngine
    programEngine.updateProcOutputs({procId, updates})
  }
}
actionCreators.addProcWithComponent = ({component}) => {
  return (dispatch, getState) => {
    const programEngine = getState().programEngine
    const proc = {component}
    programEngine.addProc(proc)
  }
}

export default { actionTypes, actionCreators }

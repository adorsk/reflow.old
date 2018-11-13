export const actionTypes = {
  setProgramEngine: 'setProgramEngine',
  setEngineState: 'setEngineState',
  updateProcUiState: 'updateProcUiState',
  updateProcWidgetState: 'updateProcWidgetState',
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
actionCreators.updateProcOutputs = ({procId, updates}) => {
  return (dispatch, getState) => {
    const programEngine = getState().programEngine
    programEngine.updateProcOutputs({procId, updates})
  }
}

export default { actionTypes, actionCreators }

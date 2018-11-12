export const actionTypes = {
  setProgramEngine: 'setProgramEngine',
  setEngineState: 'setEngineState',
  updateProcUiState: 'updateProcUiState',
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

export default { actionTypes, actionCreators }

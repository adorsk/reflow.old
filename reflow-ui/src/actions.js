export const actionTypes = {
  setEngineState: 'setEngineState',
  updateProcUiState: 'updateProcUiState',
}

export const actionCreators = {}
actionCreators.setEngineState = ({engineState}) => ({
  type: actionTypes.setEngineState,
  payload: {engineState}
})
actionCreators.updateProcUiState = ({procId, updates}) => ({
  type: actionTypes.updateProcUiState,
  payload: {procId, updates}
})

export default { actionTypes, actionCreators }

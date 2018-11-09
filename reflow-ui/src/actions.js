export const actionTypes = {
  setEngineProgram: 'setEngineProgram',
  setEngineState: 'setEngineState',
  updateProcUiState: 'updateProcUiState',
}

export const actionCreators = {}
actionCreators.setEngineProgram = ({engineProgram}) => ({
  type: actionTypes.setEngineProgram,
  payload: {engineProgram}
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

export const actionTypes = {
  updateProcUiState: 'programEditor:updateProcUiState',
  updateProcWidgetState: 'programEditor:updateProcWidgetState',
}

export const actionCreators = {}
actionCreators.updateProcUiState = ({procId, updates}) => ({
  type: actionTypes.updateProcUiState,
  payload: {procId, updates}
})
actionCreators.updateProcWidgetState = ({procId, updates}) => ({
  type: actionTypes.updateProcWidgetState,
  payload: {procId, updates}
})

export default { actionTypes, actionCreators }

export const actionTypes = {
  updateProcFrameState: 'programEditor:updateProcFrameState',
  updateProcWidgetState: 'programEditor:updateProcWidgetState',
}

export const actionCreators = {}
actionCreators.updateProcFrameState = ({procId, updates}) => ({
  type: actionTypes.updateProcFrameState,
  payload: {procId, updates}
})
actionCreators.updateProcWidgetState = ({procId, updates}) => ({
  type: actionTypes.updateProcWidgetState,
  payload: {procId, updates}
})

export default { actionTypes, actionCreators }

export const actionTypes = {
  updateProcFrameState: 'programEditor:updateProcFrameState',
  setProcFrameStates: 'programEditor:setProcFrameStates',
  updateProcWidgetState: 'programEditor:updateProcWidgetState',
  setProcWidgetStates: 'programEditor:setProcWidgetStates',
}

export const actionCreators = {}
actionCreators.updateProcFrameState = ({procId, updates}) => ({
  type: actionTypes.updateProcFrameState,
  payload: {procId, updates}
})
actionCreators.setProcFrameStates = (procFrameStates) => ({
  type: actionTypes.setProcFrameStates,
  payload: procFrameStates
})
actionCreators.updateProcWidgetState = ({procId, updates}) => ({
  type: actionTypes.updateProcWidgetState,
  payload: {procId, updates}
})
actionCreators.setProcWidgetStates = (procWidgetStates) => ({
  type: actionTypes.setProcWidgetStates,
  payload: procWidgetStates
})

export default { actionTypes, actionCreators }

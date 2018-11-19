export const actionTypes = {
  updateComponentLibrary: 'componentLibrary:updateComponentLibrary'
}

export const actionCreators = {}
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

export default { actionTypes, actionCreators }

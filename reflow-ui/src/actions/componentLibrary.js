import _ from 'lodash'

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
    const libraryModule = await import('../reflowComponents/library.js')
    dispatch(actionCreators.updateComponentLibrary({
      updates: _.keyBy(libraryModule.components, 'id')
    }))
  }
}

export default { actionTypes, actionCreators }

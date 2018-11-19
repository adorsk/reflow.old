import _ from 'lodash'

import { createProgramEngine } from '../examples/e01-TextInput/index.js'

export const actionTypes = {
  setEngine: 'programEngine:setEngine',
  setVersion: 'programEngine:setVersion',
}

export const actionCreators = {}
actionCreators.setEngine = ({engine}) => ({
  type: actionTypes.setEngine,
  payload: {engine}
})

actionCreators.updateProcOutputs = ({procId, updates}) => {
  return (dispatch, getState) => {
    const engine = getState().programEngine.engine
    engine.updateProcOutputs({procId, updates})
  }
}
actionCreators.addProcWithComponent = ({component}) => {
  return (dispatch, getState) => {
    const engine = getState().programEngine.engine
    const proc = {component}
    engine.addProc(proc)
  }
}
actionCreators.addWire = ({wire}) => {
  return (dispatch, getState) => {
    const engine = getState().programEngine.engine
    engine.addWire(wire)
  }
}

actionCreators.loadProgramEngine = () => {
  const thunk = async (dispatch, getState) => {
    const programEngine = await createProgramEngine()
    dispatch(actionCreators.setEngine({
      engine: programEngine}))
    const _setVersion = () => {
      dispatch(actionCreators.setVersion({
        version: programEngine.store.getVersion()}))
    }
    programEngine.store.subscribe(_.debounce(_setVersion), 0)
    programEngine.run()
  }
  return thunk
}

export default { actionTypes, actionCreators }

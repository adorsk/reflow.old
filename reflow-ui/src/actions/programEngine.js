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
actionCreators.setVersion = ({version}) => ({
  type: actionTypes.setVersion,
  payload: {version}
})

actionCreators.loadProgramEngine = () => {
  const thunk = async (dispatch, getState) => {
    const engine = await createProgramEngine()
    dispatch(actionCreators.setEngine({engine}))
    const _setVersion = () => {
      dispatch(actionCreators.setVersion({
        version: engine.store.getVersion()}))
    }
    engine.store.subscribe(_.debounce(_setVersion), 0)
    engine.run()
  }
  return thunk
}

export default { actionTypes, actionCreators }

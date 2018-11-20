import { createSelector } from 'reselect'
import { createSelector as ormCreateSelector } from 'redux-orm'
import _ from 'lodash'

import { orm } from './orm.js'

const selectors = {}

const _ormSelector = state => state.orm
const _createModelSelector = (({modelName}) => createSelector(
  _ormSelector,
  ormCreateSelector(orm, (session) => {
    return _.keyBy(session[modelName].all().toModelArray(), 'id')
  })
))
const _modelsToRefs = (models) => _.mapValues(models, (model) => model.ref)

selectors.program = createSelector(
  _ormSelector,
  ormCreateSelector(orm, (session) => session.Program.first().ref)
)

selectors.procs = createSelector(
  _createModelSelector({modelName: 'Proc'}),
  _modelsToRefs
)

selectors.wires = createSelector(
  _createModelSelector({modelName: 'Wire'}),
  _modelsToRefs
)

selectors.wiresByDestProcId = createSelector(
  selectors.wires,
  (wires) => _.groupBy(_.values(wires), (wire) => wire.dest.procId)
)

selectors.outputsByProcId = createSelector(
  selectors.procs,
  (procs) => _.mapValues(procs, (proc) => proc.outputs)
)

const _selectInputsByProcId = (wiresByDestProcId, outputsByProcId) => {
  const inputsByProcId = {}
  _.each(wiresByDestProcId, (incomingWires, procId) => {
    inputsByProcId[procId] = _selectInputsForProc({
      procId,
      incomingWires,
      outputsByProcId,
    })
  })
  return inputsByProcId
}

const _selectInputsForProc = ({procId, incomingWires, outputsByProcId}) => {
  const inputsForProc = {}
  const incomingWiresByPortId = _.groupBy(incomingWires, (wire) => wire.dest.portId)
  _.each(incomingWiresByPortId, (incomingWires, portId) => {
    const packets = []
    for (let wire of incomingWires) {
      const packet = _.get(outputsByProcId, [wire.src.procId, wire.src.portId])
      if (packet) { packets.push(packet) }
    }
    const newestPacket = _.maxBy(packets, 'idx')
    inputsForProc[portId] = newestPacket
  })
  inputsForProc['__version'] = _computeInputsVersion(inputsForProc)
  return inputsForProc
}

const _computeInputsVersion = (inputs) => {
  return _.keys(inputs).sort().map((key) => {
    return [key, _.get(inputs, [key, 'idx'], '')].join(':')
  }).join(';')
}

selectors.inputsByProcId = createSelector(
  selectors.wiresByDestProcId,
  selectors.outputsByProcId,
  _selectInputsByProcId
)

selectors.procsWithInputs = createSelector(
  selectors.procs,
  selectors.inputsByProcId,
  (procs, inputsByProcId) => {
    return _.mapValues(procs, (proc, procId) => {
      return {...proc, inputs: _.get(inputsByProcId, procId)}
    })
  }
)

export default selectors

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
  ormCreateSelector(orm, (session) => {
    return session.Program.first().ref
  })
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

const _selectPrevInputsByProcId = (state, prevDerivedState) => {
  const prevProcs = _.get(prevDerivedState, ['program', 'procs'])
  return _.mapValues(prevProcs, (proc) => _.get(proc, 'inputs', {}))
}

const _deriveInputsByProcId = (
  wiresByDestProcId,
  outputsByProcId,
  prevInputsByProcId
) => {
  const inputsByProcId = {}
  const procIdsForProcsWithInputs = Object.keys(wiresByDestProcId)
  for (let procId of procIdsForProcsWithInputs) {
    inputsByProcId[procId] = _selectInputsForProc({
      procId,
      incomingWires: wiresByDestProcId[procId],
      outputsByProcId,
      prevInputsForProc: _.get(prevInputsByProcId, procId, {})
    })
  }
  return inputsByProcId
}

export const _selectInputsForProc = (opts) => {
  const {procId, incomingWires, outputsByProcId, prevInputsForProc} = opts
  const nextInputsForProc = {}
  const newestIncomingPackets = _selectNewestIncomingPackets({
    procId,
    incomingWires,
    outputsByProcId
  })
  const allPortIds = Object.keys({...prevInputsForProc, ...newestIncomingPackets})
  for (let portId of allPortIds) {
    if (portId in newestIncomingPackets) {
      let nextInput = null
      const incomingPacket = newestIncomingPackets[portId]
      const prevInput = prevInputsForProc[portId]
      const isFresh = (!prevInput) || (incomingPacket.idx > prevInput.packet.idx)
      if (isFresh && incomingPacket) {
        nextInput = {isFresh, packet: incomingPacket}
      } else if (prevInput) {
        nextInput = (
          (prevInput.isFresh)
          ? {...prevInput, isFresh: false}
          : prevInput // preserve object for equality checks
        )
      }
      nextInputsForProc[portId] = nextInput
    }
  }
  return nextInputsForProc
}

const _selectNewestIncomingPackets = (opts = {}) => {
  const {procId, incomingWires, outputsByProcId} = opts
  const incomingWiresByPortId = _.groupBy(incomingWires, (wire) => wire.dest.portId)
  const newestIncomingPackets = _.mapValues(
    incomingWiresByPortId,
    (incomingWires) => {
      const packets = []
      for (let wire of incomingWires) {
        const packet = _.get(
          outputsByProcId,
          [wire.src.procId, wire.src.portId, 'packet']
        )
        if (packet) { packets.push(packet) }
      }
      const newestPacket = _.maxBy(packets, 'idx')
      return newestPacket
    }
  )
  return newestIncomingPackets
}

selectors.inputsByProcId = createSelector(
  selectors.wiresByDestProcId,
  selectors.outputsByProcId,
  _selectPrevInputsByProcId,
  _deriveInputsByProcId
)

selectors.derivedProgram = createSelector(
  selectors.program,
  selectors.procs,
  selectors.wires,
  selectors.outputsByProcId,
  selectors.inputsByProcId,
  (program, procs, wires, outputsByProcId, inputsByProcId) => {
    return {
      ...program,
      procs: _.mapValues(procs, (proc) => {
        return {
          ...proc,
          inputs: _.get(inputsByProcId, proc.id, {}),
          outputs: _.get(outputsByProcId, proc.id, {}),
        }
      }),
      wires,
    }
  }
)

export default selectors

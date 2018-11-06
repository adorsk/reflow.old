import { createSelector } from 'reselect'
import _ from 'lodash'

const selectors = {}

selectors.outputs = (state => state.outputs)

selectors.wires = (state => state.wires)

selectors.wiresByDestProcId = createSelector(
  selectors.wires,
  (wires) => _.groupBy(_.values(wires), (wire) => wire.dest.procId)
)

selectors.inputs = createSelector(
  selectors.outputs,
  selectors.wiresByDestProcId,
  (state, props) => props.prevInputs,
  (outputs, wiresByDestProcId, prevInputs) => {
    const nextInputs = {}
    const procIds = Object.keys({...wiresByDestProcId, ...prevInputs})
    for (let procId of procIds) {
      nextInputs[procId] = _selectInputsForProc({
        procId,
        incomingWires: wiresByDestProcId[procId],
        outputs,
        prevInputsForProc: prevInputs[procId] || {},
      })
    }
    return nextInputs
  }
)

const _selectInputsForProc = ({procId, incomingWires, outputs, prevInputsForProc}) => {
  const nextInputsForProc = {}
  const newestIncomingPackets = _selectNewestIncomingPackets({procId, incomingWires, outputs})
  const allPortIds = Object.keys({...prevInputsForProc, ...newestIncomingPackets})
  for (let portId of allPortIds) {
    if (portId in newestIncomingPackets) {
      let nextInput
      const incomingPacket = newestIncomingPackets[portId]
      const prevInput = prevInputsForProc[portId]
      const isFresh = (!prevInput) || (incomingPacket.idx > prevInput.packet.idx)
      if (isFresh) {
        nextInput = {isFresh, packet: incomingPacket}
      } else {
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

const _selectNewestIncomingPackets = ({procId, incomingWires, outputs}) => {
  const incomingWiresByPortId = _.groupBy(incomingWires, (wire) => wire.dest.portId)
  const newestIncomingPackets = _.mapValues(
    incomingWiresByPortId,
    (wires) => {
      const packets = wires.map((wire) => {
        return outputs[wire.src.procId][wire.src.portId].packet
      })
      const newestPacket = _.maxBy(packets, 'idx')
      return newestPacket
    }
  )
  return newestIncomingPackets
}

export default selectors

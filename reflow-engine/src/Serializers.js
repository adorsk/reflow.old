import _ from 'lodash'

import ProgramEngine from './ProgramEngine.js'
import { PacketTypes } from './constants.js'

export class ProgramEngineSerializer {
  constructor () {
    this._dataTypeHandlers = {}
  }

  serialize (engine) {
    const serialization = {}
    serialization.tickCount = engine.tickCount
    serialization.packetCount = engine.packetCount
    serialization.prevInputsByProcId = _.mapValues(
      engine.prevInputsByProcId,
      (inputsForProc) => {
        return _.mapValues(inputsForProc, (packet) => {
          return this.serializePacket(packet)
        })
      }
    )
    serialization.program = engine.getProgram()
    serialization.procs = _.mapValues(engine.getProcs(), (proc) => {
      return this.serializeProc({proc})
    })
    serialization.wires = engine.getWires()
    return serialization
  }

  serializeProc ({proc}) {
    if (!proc) { return proc }
    const basicAttrs = ['id', 'label', 'componentId', 'status', 'hidden']
    const serializedProc = _.pick(proc, basicAttrs)
    serializedProc.outputs = _.mapValues(proc.outputs, (packet, key) => {
      return this.serializePacket(packet)
    })
    serializedProc.state = (
      (proc.component && proc.component.serializeState)
        ? proc.component.serializeState(proc.state) : proc.state
    )
    return serializedProc
  }

  serializePacket (packet) {
    if (!packet) { return packet }
    const serializedPacket = _.pick(packet, ['idx', 'packetType'])
    if (packet.packetType === PacketTypes.DATA) {
      serializedPacket.data = packet.data
      if ('dataType' in packet) {
        serializedPacket.dataType = packet.dataType
        const serializeFn = _.get(
          this._dataTypeHandlers,
          [packet.dataType, 'serialize']
        )
        if (serializeFn) {
          serializedPacket.data = serializeFn(packet.data)
        }
      }
    }
    return serializedPacket
  }

  async deserialize ({serialization, componentLibrary}) {
    const progEng = new ProgramEngine({componentLibrary})
    progEng.tickCount = serialization.tickCount
    progEng.packetCount = serialization.packetCount
    progEng.prevInputsByProcId = _.mapValues(
      serialization.prevInputsByProcId,
      (inputsForProc) => {
        return _.mapValues(inputsForProc, (packetSerialization) => {
          return this.deserializePacket(packetSerialization)
        })
      }
    )
    const procPromises = _.map(
      serialization.procs,
      async (procSerialization) => {
        let proc = {...procSerialization}
        if (proc.componentId) {
          const component = await progEng.componentLibrary.get({
            key: proc.componentId
          })
          proc = {...proc, component}
          if (component && component.deserializeState) {
            proc = {...proc, state: component.deserializeState(proc.state)}
          }
        }
        return progEng.addProc(proc)
      }
    )
    await Promise.all(procPromises)
    for (let wire of _.values(serialization.wires)) {
      progEng.addWire(wire)
    }
    return progEng
  }

  deserializePacket (serialization) {
    if (!serialization) { return serialization }
    const packet = {...serialization}
    if (packet.packetType === PacketTypes.DATA) {
      if ('dataType' in packet) {
        const deserializeFn = _.get(
          this._dataTypeHandlers,
          [packet.dataType, 'deserialize']
        )
        if (deserializeFn) {
          packet.data = deserializeFn(serialization.data)
        }
      }
    }
    return packet
  }
}

export default { ProgramEngineSerializer }

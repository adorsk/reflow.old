import _ from 'lodash'

import ProgramEngine from './ProgramEngine.js'
import { PacketTypes } from './constants.js'


class SerDes {
  constructor () {
    this._dataTypeHandlers = {}
  }

  registerSerDesForDataType ({dataType, serDes}) {
    this._dataTypeHandlers[dataType] = serDes
  }

  serializeProgramEngine (programEngine) {
    const serialization = {}
    serialization.tickCount = programEngine.tickCount
    serialization.packetCount = programEngine.packetCount
    serialization.prevInputsByProcId = _.mapValues(
      programEngine.prevInputsByProcId,
      (inputsForProc) => {
        return _.mapValues(inputsForProc, (packet) => {
          return this.serializePacket(packet)
        })
      }
    )
    const program = programEngine.getProgram()
    serialization.procs = _.mapValues(program.procs, (proc) => {
      return this.serializeProc({proc})
    })
    serialization.wires = program.wires
    return serialization
  }

  serializeProc ({proc}) {
    if (! proc) { return proc }
    const serializedProc = _.pick(proc, ['id', 'label', 'componentId'])
    serializedProc.outputs = _.mapValues(proc.outputs, (packet, key) => {
      return this.serializePacket(packet)
    })
    serializedProc.state = (
      (proc.component.serializeState)
      ? proc.component.serializeState(proc.state) : proc.state
    )
    return serializedProc
  }

  serializePacket (packet) {
    if (! packet) { return packet }
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

  async deserializeProgramEngine ({serializedProgramEngine}) {
    const programEngine = new ProgramEngine()
    programEngine.tickCount = serializedProgramEngine.tickCount
    programEngine.packetCount = serializedProgramEngine.packetCount
    const serializedProcs = serializedProgramEngine.procs
    const procPromises = _.map(serializedProcs, async (serializedProc) => {
      const proc = await this.deserializeProc({serializedProc})
      return await programEngine.addProc(proc)
    })
    await Promise.all(procPromises)
    programEngine.prevInputsByProcId = serializedProgramEngine.prevInputsByProcId
    _.each(dump.wires, (wire) => programEngine.addWire(wire))
    return programEngine
  }

  async deserializeProc ({serializedProc}) {
  }
}

export default SerDes

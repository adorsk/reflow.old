import _ from 'lodash'

import ProgramEngine from './ProgramEngine.js'
import { PacketTypes } from './constants.js'


class SerDes {
  serializeProgramEngine ({programEngine}) {
    const serialization = {}
    serialization.tickCount = program.tickCount
    serialization.packetCount = program.packetCount
    serialization.procs = _.mapValues(programEngine.getProcs(), (proc) => {
      this.serializeProc({proc})
    })
    serialization.prevInputsByProcId = _.mapValues(
      programEngine.prevInputsByProcId,
      (inputs) => _.mapValues(inputs, (packet) => {
        return this.serializePacket(packet)
      })
    )
    serialization.wires = programEngine.wires
  }

  serializeProc ({proc}) {
    if (! proc) { return proc }
    const serializedProc = _.pick(proc, ['id', 'label', 'componentId'])
    serializedProc.outputs = _.mapValues(outputs, (packet, key) => {
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
    const serializedPacket = _.pick(packet, ['idx', 'type'])
    if (packet.type === PacketTypes.DATA) {
      serializedPacket.data = (
        (packet.serializer)
        ? packet.serializer(packet.data) : packet.data
      )
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

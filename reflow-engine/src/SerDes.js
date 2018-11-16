import ProgramEngine from './ProgramEngine.js'


class SerDes {
  serializeProgramEngine ({programEngine}) {
    const serialization = {}
    serialization.tickCount = program.tickCount
    serialization.packetCount = program.packetCount
    serialization.procs = _.map(programEngine.getProcs(), (proc) => {
      this.serializeProc({proc})
    })
    serialization.prevInputsByProcId = programEngine.prevInputsByProcId
    serialization.wires = programEngine.wires
  }

  serializeProc ({proc}) {
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

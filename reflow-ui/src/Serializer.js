import _ from 'lodash'
import ProgramEngine from 'reflow-engine/src/ProgramEngine.js'

class Serializer {
  serialize ({programState, widgets}) {
    const serialized = {
      programEngine: programState.programEngine.serialize(),
      frameStates: programState.frameStates,
      widgetStates: _.mapValues(
        programState.widgetStates,
        (widgetState, procId) => {
          const serializeState = _.get(widgets, [procId, 'serializeState'])
          return (serializeState) ? serializeState(widgetState) : widgetState
        }
      )
    }
    return serialized
  }

  async deserialize ({serialization, componentLibrary}) {
    const deserialized = {
      programEngine: await this.deserializeProgramEngine({
        serialization: serialization.programEngine,
        componentLibrary,
      }),
      frameStates: serialization.frameStates,
      widgetStates: serialization.widgetStates,
    }
    return deserialized
  }

  async deserializeProgramEngine ({serialization, componentLibrary}) {
    return await ProgramEngine.createFromSerialization({
      serialization, componentLibrary})
  }
}

export default Serializer

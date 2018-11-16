import ProgramEngine from 'reflow-engine/src/ProgramEngine.js'
import TextInputComponent from './components/TextInput/index.js'
import LoggerComponent from './components/Logger/index.js'

export async function createProgramEngine () {
  const progEngine = new ProgramEngine()
  progEngine.componentLibrary.set({key: 'TextInput', value: TextInputComponent})
  await progEngine.addProc({id: 'textInput', componentId: 'TextInput'})
  progEngine.componentLibrary.set({key: 'logger', value: LoggerComponent})
  await progEngine.addProc({id: 'logger', componentId: 'logger'})
  progEngine.addWire({
    src: {
      procId: 'textInput',
      portId: 'OUT',
    },
    dest: {
      procId: 'logger',
      portId: 'IN'
    }
  })
  return progEngine
}

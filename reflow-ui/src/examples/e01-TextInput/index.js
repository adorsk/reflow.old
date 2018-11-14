import ProgramEngine from 'reflow-engine/src/ProgramEngine.js'
import TextInputComponent from './components/TextInput/index.js'
import LoggerComponent from './components/Logger/index.js'

export async function createProgramEngine () {
  const progEngine = new ProgramEngine()
  await progEngine.addProc({
    id: 'textInput',
    component: TextInputComponent
  })
  await progEngine.addProc({
    id: 'logger',
    component: LoggerComponent
  })
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

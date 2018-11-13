import ProgramEngine from 'reflow-engine/src/ProgramEngine.js'
import TextInputComponent from './components/TextInput/index.js'
import LoggerComponent from './components/Logger/index.js'

export function createProgramEngine () {
  const progEngine = new ProgramEngine()
  progEngine.addProc({
    id: 'textInput',
    component: TextInputComponent
  })
  progEngine.addProc({
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

import ProgramEngine from './../src/ProgramEngine.js'
import components from './components/index.js'

export const createProgramEngine = (opts = {}) => {
  const programArgs = opts.programArgs || []
  const progEngine = new ProgramEngine(...programArgs)
  progEngine.addProc({
    id: 'generate',
    component: components.generator.getInstance()
  })
  progEngine.addProc({
    id: 'copy',
    component: components.copier.getInstance()
  })
  progEngine.addProc({
    id: 'receive',
    component: components.receiver.getInstance()
  })
  progEngine.addWire({
    src: { procId: 'generate', portId: 'OUT' },
    dest: { procId: 'copy', portId: 'IN' },
  })
  progEngine.addWire({
    src: { procId: 'copy', portId: 'OUT' },
    dest: { procId: 'receive', portId: 'IN' },
  })
  progEngine.sendInputsToProc({
    procId: 'generate',
    inputs: {'COUNT': {data: 3}}
  })
  return progEngine
}

if (typeof require != 'undefined' && require.main == module) {
  const progEngine = createProgramEngine()
  progEngine.run().then(() => {
    console.log('done!')
  })
}

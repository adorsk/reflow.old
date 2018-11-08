import Program from './../src/Program.js'
import components from './components/index.js'

export const createProgram = (opts = {}) => {
  const programArgs = opts.programArgs || []
  const prog = new Program(...programArgs)
  prog.addProc({
    id: 'generate',
    component: components.generator.getInstance()
  })
  prog.addProc({
    id: 'copy',
    component: components.copier.getInstance()
  })
  prog.addProc({
    id: 'receive',
    component: components.receiver.getInstance()
  })
  prog.addWire({
    src: { procId: 'generate', portId: 'OUT' },
    dest: { procId: 'copy', portId: 'IN' },
  })
  prog.addWire({
    src: { procId: 'copy', portId: 'OUT' },
    dest: { procId: 'receive', portId: 'IN' },
  })
  prog.sendInputsToProc({
    procId: 'generate',
    inputs: {'COUNT': {data: 3}}
  })
  return prog
}

if (typeof require != 'undefined' && require.main == module) {
  const prog = createProgram()
  prog.run().then(() => {
    console.log('done!')
  })
}

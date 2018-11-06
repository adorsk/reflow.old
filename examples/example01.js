import reflow from './../src/reflow.js'
import components from './components/index.js'

const prog = new reflow.Program()

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
  src: { procId: 'generate', ioId: 'OUT' },
  dest: { procId: 'copy', ioId: 'IN' },
})
prog.addWire({
  src: { procId: 'copy', ioId: 'OUT' },
  dest: { procId: 'receive', ioId: 'IN' },
})

prog.updateProcInputs({
  procId: 'generate',
  values: {'IN': 2000}
})

prog.run()

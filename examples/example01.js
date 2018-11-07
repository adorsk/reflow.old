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
  src: { procId: 'generate', portId: 'OUT' },
  dest: { procId: 'copy', portId: 'IN' },
})
prog.addWire({
  src: { procId: 'copy', portId: 'OUT' },
  dest: { procId: 'receive', portId: 'IN' },
})

prog.updateProcInputs({
  procId: 'generate',
  values: {'IN': 2000}
})

prog.run()

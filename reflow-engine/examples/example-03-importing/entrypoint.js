import ProgramEngine from '../../src/ProgramEngine.js'

export async function createProgramEngine (opts = {}) {
  const programArgs = opts.programArgs || []
  const progEngine = new ProgramEngine(...programArgs)
  const proc = await progEngine.resolveProcFromSpec({
    procSpec: {
      type: 'inline',
      value: {
        id: 'proc1',
        tickFnSpec: {
          type: 'fn',
          fn: async () => {
            const module = await import('./myComponent.js')
            return module.tickFn
          }
        }
      }
    }
  })
  progEngine.addProc(proc)
  return progEngine
}

if (typeof require != 'undefined' && require.main == module) {
  createProgramEngine()
    .then(progEngine => progEngine.run())
    .then(() => { console.log('done!') })
}

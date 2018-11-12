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
          type: 'inline',
          value: (opts) => {
            console.log('proc1.tickFn!')
            opts.resolve()
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

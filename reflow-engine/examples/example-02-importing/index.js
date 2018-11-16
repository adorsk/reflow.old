import ProgramEngine from '../../src/ProgramEngine.js'

export async function createProgramEngine (opts = {}) {
  const programArgs = opts.programArgs || []
  const progEngine = new ProgramEngine(...programArgs)
  const proc = await progEngine.resolveProcFromSpec({
    procSpec: {
      type: 'inline',
      value: {
        id: 'proc1',
        componentSpec: {
          type: 'fn',
          fn: async () => {
            const module = await import('./myComponent.js')
            return module.default
          }
        }
      }
    }
  })
  await progEngine.addProc(proc)
  return progEngine
}

if (typeof require !== 'undefined' && require.main === module) {
  const keepAliveTimer = setInterval(() => null, 100)
  createProgramEngine()
    .then((progEngine) => progEngine.run({maxTicks: 10}))
    .finally(() => {
      clearInterval(keepAliveTimer)
      console.log('done!')
    })
}

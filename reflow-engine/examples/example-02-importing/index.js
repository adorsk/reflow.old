import ProgramEngine from '../../src/ProgramEngine.js'
import MyComponent from './myComponent.js'

export async function createProgramEngine (opts = {}) {
  const programArgs = opts.programArgs || []
  const progEngine = new ProgramEngine(...programArgs)
  progEngine.componentLibrary.set({
    key: 'myComponent',
    value: MyComponent
  })
  await progEngine.addProc({id: 'myComponentProc', componentId: 'myComponent'})
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

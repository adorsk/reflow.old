import ProgramEngine from '../../src/ProgramEngine.js'


export async function createProgramEngine () {
  const progEngine = new ProgramEngine()

  progEngine.componentLibrary.set({
    key: 'generate',
    value: {
      getTickFn () {
        return function tickFn({state, inputs, updateOutputs, resolve, updateState}) {
          if (inputs.fresh.COUNT) {
            updateState({
              emitting: true,
              numToEmit: inputs.fresh.COUNT.data,
              counter: 0
            })
          }
          if (state.emitting) {
            if (state.counter >= state.numToEmit) {
              updateState({emitting: false})
              resolve()
            } else {
              updateOutputs({OUT: {data: state.counter}})
              updateState({counter: state.counter + 1})
            }
          }
        }
      }
    }
  })
  await progEngine.addProc({id: 'generate', componentId: 'generate'})

  progEngine.componentLibrary.set({
    key: 'copy',
    value: {
      getTickFn () {
        return function tickFn({state, inputs, prevInputs, updateOutputs, resolve, updateState}) {
          if (inputs.fresh.IN) {
            updateOutputs({'OUT': inputs.fresh.IN})
            resolve()
          }
        }
      }
    }
  })
  await progEngine.addProc({id: 'copy', componentId: 'copy'})

  progEngine.componentLibrary.set({
    key: 'receive',
    value: {
      getTickFn () {
        return function tickFn ({inputs, prevInputs, resolve}) {
          if (inputs.fresh.IN) {
            const packet = inputs.fresh.IN
            if (packet.type === 'OPEN') {
              console.log('open')
            }
            else if (packet.type == 'CLOSE') {
              console.log('close')
            }
            else {
              console.log('data ', packet.data)
              resolve()
            }
          }
        }
      }
    }
  })
  await progEngine.addProc({id: 'receive', componentId: 'receive'})

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

if (typeof require !== 'undefined' && require.main === module) {
  const keepAliveTimer = setInterval(() => null, 100)
  createProgramEngine()
    .then((progEngine) => progEngine.run({maxTicks: 10}))
    .finally(() => {
      clearInterval(keepAliveTimer)
      console.log('done!')
    })
}

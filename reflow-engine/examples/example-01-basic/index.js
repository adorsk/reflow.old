import ProgramEngine from '../../src/ProgramEngine.js'


export async function createProgramEngine () {
  const progEngine = new ProgramEngine()
  await progEngine.addProc({
    id: 'generate',
    component: {
      getTickFn () {
        return function tickFn({state, inputs, prevInputs, updateOutputs, resolve, updateState}) {
          if (inputs.COUNT && (inputs.COUNT !== prevInputs.COUNT)) {
            updateState({
              emitting: true,
              numToEmit: inputs.COUNT.data,
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
  await progEngine.addProc({
    id: 'copy',
    component: {
      getTickFn () {
        return function tickFn ({inputs, prevInputs, updateOutputs, resolve}) {
          if (inputs.IN && (inputs.IN !== prevInputs.IN)) {
            updateOutputs({'OUT': {data: inputs.IN.data}})
            resolve()
          }
        }
      }
    },
  })
  progEngine.addProc({
    id: 'receive',
    component: {
      getTickFn () {
        return function tickFn ({inputs, prevInputs, resolve}) {
          if (inputs.IN && (inputs.IN !== prevInputs.IN)) {
            const packet = inputs.IN
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

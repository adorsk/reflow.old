import ProgramEngine from '../../src/ProgramEngine.js'


export async function createProgramEngine () {
  const progEngine = new ProgramEngine()

  progEngine.componentLibrary.set({
    key: 'generate',
    value: {
      getTickFn () {
        return function tickFn({state, inputs, actions}) {
          if (inputs.fresh.COUNT) {
            actions.updateState({
              emitting: true,
              numToEmit: inputs.fresh.COUNT.data,
              counter: 0
            })
          }
          if (state.emitting) {
            if (state.counter >= state.numToEmit) {
              actions.updateState({emitting: false})
              actions.resolve()
            } else {
              actions.updateOutputs({OUT: state.counter})
              actions.updateState({counter: state.counter + 1})
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
        return function tickFn({state, inputs, actions}) {
          if (inputs.fresh.IN) {
            actions.updateOutputs({'OUT': inputs.fresh.IN})
            actions.resolve()
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
        return function tickFn ({state, inputs, actions, constants}) {
          if (inputs.fresh.IN) {
            const packet = inputs.fresh.IN
            switch (packet.packetType) {
              case constants.PacketTypes.OPEN:
                console.log('open')
                break
              case constants.PacketTypes.CLOSE:
                console.log('close')
                break
              case constants.PacketTypes.DATA:
                console.log('data ', packet.data)
                actions.resolve()
                break
              default:
                break
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

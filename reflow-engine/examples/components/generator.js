class Generator {
  tick ({state, inputs, prevInputs, updateOutputs, resolve, updateState}) {
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

export default {
  getInstance: () => new Generator()
}

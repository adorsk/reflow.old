class Generator {
  constructor () {
    this.state = {
      emitting: false,
      numToEmit: 0,
      counter: 0,
    }
  }

  tick ({inputs, prevInputs, updateOutputs, resolve}) {
    console.log("i: ", inputs.COUNT, "pi: ", prevInputs.COUNT)
    if (inputs.COUNT && (inputs.COUNT !== prevInputs.COUNT)) {
      this.state.emitting = true
      this.state.numToEmit = inputs.COUNT.data
      this.state.counter = 0
    }
    if (this.state.emitting) {
      if (this.state.counter >= this.state.numToEmit) {
        this.state.emitting = false
        resolve()
      } else {
        updateOutputs({OUT: {data: this.state.counter}})
        this.state.counter += 1
      }
    }
  }
}

export default {
  getInstance: () => new Generator()
}

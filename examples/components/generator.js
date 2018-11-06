class Generator {
  constructor () {
    this.state = {
      emitting: false,
      numToEmit: 0,
      counter: 0,
    }
  }

  tick ({inputs, setOutputs}) {
    if (inputs.COUNT.isFresh) {
      this.state.emitting = true
      this.state.numToEmit = inputs.n.value
      this.state.counter = 0
    }
    if (this.state.emitting) {
      if (this.state.counter >= this.state.numToEmit) {
        this.state.emitting = false
      } else {
        setOutputs({OUT: this.state.counter})
        this.state.counter += 1
      }
    }
  }
}

export default {
  getInstance: () => new Generator()
}

class Copier {
  constructor () {
    this.prevInputs = {}
  }

  tick ({inputs, updateOutputs, resolve}) {
    if (inputs.IN && (inputs.IN !== this.prevInputs.IN)) {
      updateOutputs({'OUT': {data: inputs.IN.data}})
      resolve()
    }
    this.prevInputs = inputs
  }
}

export default {
  getInstance: () => new Copier()
}

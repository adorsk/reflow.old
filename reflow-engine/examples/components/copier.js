class Copier {
  tick ({inputs, prevInputs, updateOutputs, resolve}) {
    if (inputs.IN && (inputs.IN !== prevInputs.IN)) {
      updateOutputs({'OUT': {data: inputs.IN.data}})
      resolve()
    }
  }
}

export default {
  getInstance: () => new Copier()
}

class Copier {
  tick ({inputs, setOutputs}) {
    if (inputs.IN.isFresh) {
      setOutputs({'OUT': inputs.IN})
    }
  }
}

export default {
  getInstance: () => new Copier()
}

class Copier {
  tick ({inputs, updateOutputs, resolve}) {
    if (inputs.IN && inputs.IN.isFresh) {
      updateOutputs({'OUT': {data: inputs.IN.packet.data}})
      resolve()
    }
  }
}

export default {
  getInstance: () => new Copier()
}

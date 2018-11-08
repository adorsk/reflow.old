class Receiver {
  tick ({inputs, prevInputs, resolve}) {
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

export default {
  getInstance: () => new Receiver()
}

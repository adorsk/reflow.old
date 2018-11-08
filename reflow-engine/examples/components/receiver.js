class Receiver {
  constructor () {
    this.prevInputs = {}
  }
  tick ({inputs, resolve}) {
    if (inputs.IN && (inputs.IN !== this.prevInputs.IN)) {
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
    this.prevInputs = inputs
  }
}

export default {
  getInstance: () => new Receiver()
}

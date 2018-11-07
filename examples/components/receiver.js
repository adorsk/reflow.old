class Receiver {
  tick ({inputs, resolve}) {
    if (inputs.IN && inputs.IN.isFresh) {
      const packet = inputs.IN.packet
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

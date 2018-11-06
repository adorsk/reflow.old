class Receiver {
  tick ({inputs}) {
    if (inputs.IN.isFresh) {
      const packet = inputs.IN.packet
      if (packet.type === 'OPEN') {
        console.log('open')
      }
      else if (packet.type == 'CLOSE') {
        console.log('close')
      }
      else {
        console.log('data ', packet.contents)
      }
    }
  }
}

export default {
  getInstance: () => new Receiver()
}

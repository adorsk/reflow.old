class Store {
  constructor (initialState = {}) {
    this.state = {
      procDefs: {},
      wires: {},
      outputs: {},
      ...initialState
    }
    this.subscriberCallbacks = []
    // Add initial hidden root proc, for setting inputs.
  }

  subscribe (callback) {
    this.subscriberCallbacks.push(callback)
  }

  setState (nextState) {
    this.state = nextState
    for (let callback of this.subscriberCallbacks) {
      callback(this.state)
    }
  }

  updateState (updates) {
    this.setState({...this.state, ...updates})
  }

  addProcDef (proc) {
    this.updateState({
      procDefs: Object.assign({}, this.state.procDefs, {[proc.id]: proc})
    })
    return proc
  }

  addWire (wire) {
    const wireId = this.getWireId(wire)
    this.updateState({
      wires: Object.assign({}, this.state.wires, {[wireId]: wire})
    })
    return wire
  }

  getWireId (wire) {
    const wireId = (
      [wire.src, wire.dest].map(portDef => {
        return [portDef.procId, portDef.ioId].join(':')
      })
      .join(' -> ')
    )
    return wireId
  }

  getWire (wireDef) {
    const wireId = this.getWireId(wireDef)
    return this.state.wires[wireId]
  }

  updateProcOutputs ({procId, values}) {
    const prevOutputs = this.state.outputs[procId] || {}
    const nextOutputs = Object.assign({}, prevOutputs)
    for (let key of Object.keys(values)) {
      nextOutputs[key] = {
        timestamp: (new Date() / 1000),
        value: values[key],
      }
    }
    this.updateState({
      outputs: {...this.state.outputs, [procId]: nextOutputs}
    })
  }
}

export default Store

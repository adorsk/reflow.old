class Store {
  constructor (initialState = {}) {
    this.state = {
      procs: {},
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

  addProc (proc) {
    this.updateState({
      procs: Object.assign({}, this.state.procs, {[proc.id]: proc})
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
        return [portDef.procId, portDef.portId].join(':')
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
        packet: {
          timestamp: (new Date() / 1000),
          value: values[key],
        }
      }
    }
    this.updateState({
      outputs: {...this.state.outputs, [procId]: nextOutputs}
    })
  }

  updateProc ({procId, updates}) {
    this.updateState({
      procs: {
        ...this.state.procs,
        [procId]: {...this.state.procs[procId], ...updates}
      }
    })
  }
}

export default Store

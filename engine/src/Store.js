class Store {
  constructor (initialState = {}) {
    this.state = {
      procs: {},
      wires: {},
      outputs: {},
      status: null,
      ...initialState
    }
    this._packetCounter = 0
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

  updateProcOutputs ({procId, updates}) {
    const prevOutputs = this.state.outputs[procId] || {}
    const nextOutputs = Object.assign({}, prevOutputs)
    for (let portId of Object.keys(updates)) {
      nextOutputs[portId] = {
        packet: {
          idx: this._packetCounter++,
          timestamp: (new Date() / 1000),
          ...updates[portId],
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

  updateProcStatus ({procId, status}) {
    this.updateProc({procId, updates: {status}})
  }

  updateStatus ({status}) {
    this.updateState({status})
  }
}

export default Store

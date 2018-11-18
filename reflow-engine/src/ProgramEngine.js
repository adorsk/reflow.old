import _ from 'lodash'

import * as constants from './constants.js'
import Store from './store/Store.js'
import ComponentLibrary from './ComponentLibrary.js'

const Statuses = {
  RESOLVED: 'RESOLVED',
  RUNNING: 'RUNNING',
}

class ProgramEngine {
  constructor (opts = {}) {
    this.store = opts.store || this._createStore()
    this.componentLibrary = opts.componentLibrary || this._createComponentLibrary()
    this.store.actions.program.create({id: 'mainProgram'})
    this._addRootProc()
    this.tickCount = 0
    this.packetCount = 0
    this.prevInputsByProcId = null
  }

  _createStore () { return new Store() }
  _createComponentLibrary () { return new ComponentLibrary() }

  _addRootProc () {
    this.addProc({
      id: constants.rootProcId,
      status: Statuses.RESOLVED,
      hidden: true,
    })
  }

  async addProc (proc) {
    if (!proc.component && proc.componentId) {
      proc = {
        ...proc,
        component: await this.componentLibrary.get({key: proc.componentId})
      }
    }
    if (!proc.tickFn && proc.component && proc.component.getTickFn) {
      proc = {
        ...proc,
        tickFn: await proc.component.getTickFn()
      }
    }
    this.store.actions.proc.create(proc)
  }

  async resolveProcComponent (proc) {
    if (!proc.component && proc.componentId) {
      proc.component = await this.componentLibrary.get({key: proc.componentId})
    }
  }

  addWire (wire) {
    this.store.actions.wire.create(wire)
  }

  getProgram () {
    return this.store.getProgram()
  }

  getProcs () {
    return _.get(this.store.getProgram(), 'procs')
  }

  getWires () {
    return _.get(this.store.getProgram(), 'wires')
  }

  updateProc ({id, updates}) {
    this.store.actions.proc.update({id, updates})
  }

  sendInputsToProc ({procId, inputs}) {
    for (let portId of Object.keys(inputs)) {
      const packet = inputs[portId]
      const rootProcPortId = [procId, portId].join(':')
      this.store.actions.wire.create({
        src: {
          procId: constants.rootProcId,
          portId: rootProcPortId
        },
        dest: {procId, portId}
      })
      this.updateProcOutputs({
        procId: constants.rootProcId,
        updates: { [rootProcPortId]: packet }
      })
    }
  }

  updateProcOutputs ({procId, updates}) {
    const updatesWithIdxs = _.mapValues(updates, (packet) => {
      return {packet: {...packet, idx: this.packetCount++}}
    })
    return this.store.actions.proc.updateOutputs({
      id: procId,
      updates: updatesWithIdxs
    })
  }

  async run (opts = {}) {
    console.log('run')
    const { maxTicks } = opts
    const runPromise = new Promise((resolve, reject) => {
      const onStoreChange = () => {
        const program = this.getProgram()
        if (maxTicks && this.tickCount > maxTicks) {
          throw new Error('exceeded max ticks')
        }
        if (program.status === Statuses.RESOLVED) { resolve() }
        else { this._tick({program}) }
      }
      // The debounce is important: it allows us avoid infinite recursion
      // by consolidating ticks. We only do the next tick when
      // state updates for the current tick have finished.
      this.store.subscribe(_.debounce(onStoreChange), 0)
      this._tick({program: this.getProgram()})
    })
    this._tick({program: this.getProgram()}) // initial tick
    return runPromise
  }

  _tick ({program = {}}) {
    console.debug('_tick', this.tickCount++)
    if (!program) { return }
    const prevInputsByProcId = this.store.getInputsByProcId()
    for (let proc of _.values(program.procs)) { this._tickProc({proc}) }
    if (!this._hasUnresolvedProcs({program})) {
      this.store.actions.program.update({
        id: program.id,
        updates: { status: Statuses.RESOLVED }
      })
    }
    this.prevInputsByProcId = prevInputsByProcId
  }

  _hasUnresolvedProcs ({program}) {
    return _.some(program.procs, (proc) => (proc.status !== Statuses.RESOLVED))
  }

  _tickProc ({proc}) {
    if (!proc.tickFn) { return }
    const inputs = _.get(proc, ['inputs'], {})
    const prevInputs = _.get(this.prevInputsByProcId, proc.id, {})
    const inputsUnchanged = (inputs.__version === prevInputs.__version)
    const isResolved = (proc.status === Statuses.RESOLVED)
    if (inputsUnchanged && isResolved) { return }
    this._updateProcStatus({procId: proc.id, status: Statuses.RUNNING})
    proc.tickFn({
      inputs: {
        current: inputs,
        prev: prevInputs,
        fresh: this._computeFreshInputs({currentInputs: inputs, prevInputs}),
      },
      state: _.get(proc, ['state'], {}),
      actions: {
        updateOutputs: (packetsByPort) => {
          this.updateProcOutputs({
            procId: proc.id,
            updates: _.mapValues(packetsByPort, (packet) => {
              return this._sanitizePacket(packet)
            })
          })
        },
        resolve: () => {
          this._updateProcStatus({procId: proc.id, status: Statuses.RESOLVED})
        },
        updateState: (updates) => {
          this._updateProcState({procId: proc.id, updates})
        }
      },
      constants: {PacketTypes: constants.PacketTypes}
    })
  }

  _updateProcStatus ({procId, status}) {
    return this.store.actions.proc.update({
      id: procId,
      updates: {status}
    })
  }

  _computeFreshInputs ({currentInputs, prevInputs}) {
    const freshInputs = {}
    for (let key of _.keys(currentInputs)) {
      if (
        (!(key in prevInputs)) ||
        (_.get(currentInputs[key], 'idx') !== _.get(prevInputs[key], 'idx'))
      ) { freshInputs[key] = currentInputs[key] }
    }
    return freshInputs
  }

  _sanitizePacket (packet) {
    if (packet && !packet.packetType) {
      packet = {
        packetType: constants.PacketTypes.DATA,
        data: packet
      }
    }
    return packet
  }

  _updateProcState ({procId, updates}) {
    return this.store.actions.proc.updateState({id: procId, updates: updates})
  }
}

export default ProgramEngine

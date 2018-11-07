import _ from 'lodash'

import Store from './Store.js'
import * as constants from './constants.js'
import NoopComponent from './components/Noop.js'
import selectors from './selectors.js'


const Statuses = {
  RESOLVED: 'RESOLVED',
}

class Program {
  constructor () {
    this.props = {}
    this.store = new Store()
    this._addRootProc()
  }

  _addRootProc () {
    this.addProc({
      id: constants.rootProcId,
      component: NoopComponent.getInstance(),
      status: Statuses.RESOLVED,
    })
  }

  addProc (proc) {
    this.store.addProc(proc)
  }

  addWire (wire) {
    this.store.addWire(wire)
  }

  sendInputsToProc ({procId, inputs}) {
    console.log('sendInputsToProc')
    for (let portId of Object.keys(inputs)) {
      const packet = inputs[portId]
      const rootProcPortId = [procId, portId].join(':')

      // Get or create wire
      const wireDef = {
        src: {
          procId: constants.rootProcId,
          portId: rootProcPortId,
        },
        dest: {
          procId,
          portId
        },
      }
      const wireId = this.store.getWireId(wireDef)
      let wire = this.store.getWire(wireDef) || this.store.addWire(wireDef)

      // set output on root port.
      this._updateProcOutputs({
        procId: constants.rootProcId,
        updates: { [rootProcPortId]: packet }
      })
    }
  }

  _updateProcOutputs ({procId, updates}) {
    return this.store.updateProcOutputs({procId, updates})
  }

  run () {
    console.log('run')
    const keepAliveTimer = setInterval(() => null, 100)

    const runPromise = new Promise((resolve, reject) => {
      this.store.subscribe(_.debounce((state) => {
        const prevProps = this.props
        this.props = this._mapStateToProps({state, prevProps})
        if (this.props.status === Statuses.RESOLVED) {
          resolve()
        } else {
          this._tick({prevProps})
        }
      }, 0))

      // initial tick
      const prevProps = {}
      this.props = this._mapStateToProps({state: this.store.state, prevProps})
      this._tick({prevProps})
    })

    return runPromise.then((...args) => {
      clearInterval(keepAliveTimer)
      return args
    })
  }


  _mapStateToProps ({state, prevProps}) {
    return {
      status: state.status,
      procs: selectors.procs(state),
      inputs: selectors.inputs(state, {prevInputs: prevProps.inputs}),
      outputs: selectors.outputs(state),
      wires: selectors.wires(state),
    }
  }

  _tick({prevProps}) {
    console.log('_tick')
    for (let procId of _.keys(this.props.procs)) {
      this._tickProc({procId})
    }
    const removedProcIds = this._getRemovedProcIds({prevProps})
    for (let procId of removedProcIds) {
      this._removeProc({procId, prevProps})
    }
    if (!this._hasUnresolvedProcs()) {
      this.store.updateState({status: Statuses.RESOLVED})
    }
  }

  _hasUnresolvedProcs () {
    return _.some(this.props.procs, (proc) => (proc.status !== Statuses.RESOLVED))
  }

  _tickProc ({procId}) {
    const proc = this.props.procs[procId]
    proc.component.tick({
      inputs: (this.props.inputs[procId] || {}),
      updateOutputs: (updates) => {
        this._updateProcOutputs({procId, updates})
      },
      resolve: () => {
        this._updateProcStatus({procId, status: 'RESOLVED'})
      },
    })
  }

  _updateProcStatus ({procId, status}) {
    return this.store.updateProcStatus({procId, status})
  }

  _getRemovedProcIds ({prevProps}) {
    return _.difference(_.keys(prevProps.procs), _.keys(this.props.procs))
  }
}

export default Program

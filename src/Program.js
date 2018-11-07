import _ from 'lodash'

import Store from './Store.js'
import * as constants from './constants.js'
import NoopComponent from './components/Noop.js'
import selectors from './selectors.js'

const ProcStatuses = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  COMPONENT_NOT_LOADED: 'COMPONENT_NOT_LOADED',
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
      status: ProcStatuses.ACTIVE,
    })
  }

  addProc (proc) {
    this.store.addProc({status: ProcStatuses.INACTIVE, ...proc})
  }

  addWire (wire) {
    this.store.addWire(wire)
  }

  updateProcInputs ({procId, values}) {
    console.log('updateProcInputs')
    for (let valueKey of Object.keys(values)) {
      const value = values[valueKey]
      const portId = [procId, valueKey].join(':')

      // Get or create wire
      const wireDef = {
        src: {
          procId: constants.rootProcId,
          portId: portId,
        },
        dest: {
          procId,
          portId: valueKey
        },
      }
      const wireId = this.store.getWireId(wireDef)
      let wire = this.store.getWire(wireDef) || this.store.addWire(wireDef)

      // set output on root port.
      this._updateProcOutputs({
        procId: constants.rootProcId,
        values: { [portId]: value }
      })
    }
  }

  _updateProcOutputs (...args) {
    return this.store.updateProcOutputs(...args)
  }

  run () {
    console.log('run')
    this.store.subscribe(_.debounce(this._onStateChange.bind(this), 0))
    const prevProps = {}
    this.props = this._mapStateToProps({state: this.store.state, prevProps})
    this._tick({prevProps})
  }

  _onStateChange ({state}) {
    const prevProps = this.props
    this.props = this._mapStateToProps({state, prevProps})
    this._tick({prevProps})
  }

  _mapStateToProps ({state, prevProps}) {
    return {
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
    // update program state.
  }

  _tickProc ({procId}) {
    const proc = this.props.procs[procId]
    proc.component.tick({
      inputs: (this.props.inputs[procId] || {}),
      setOutputs: (values) => this._updateProcOutputs({procId, values})
    })
  }

  _updateProc ({procId, updates}) {
    this.store.updateProc({procId, updates})
  }

  _getRemovedProcIds ({prevProps}) {
    return _.difference(_.keys(prevProps.procs), _.keys(this.props.procs))
  }
}

export default Program

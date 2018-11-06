import { assert } from 'chai'

import selectors from './selectors.js'

describe('selectors.inputs', () => {

  it('incoming -> undefined', () => {
    const state = {
      outputs: {
        'srcProc': {
          'port1': {
            packet: {id: 'packet1', timestamp: 1},
          }
        }
      },
      wires: {
        'srcProc:port1 -> destProc:port1': {
          src: {procId: 'srcProc', portId: 'port1'},
          dest: {procId: 'destProc', portId: 'port1'},
        }
      }
    }
    const prevInputs = {}
    const actual = selectors.inputs(state, {prevInputs})
    const expected = {
      'destProc': {
        'port1': {
          isFresh: true,
          packet: state.outputs['srcProc']['port1'].packet
        }
      }
    }
    assert.deepEqual(actual, expected)
  })

  it('incoming -> older', () => {
    const state = {
      outputs: {
        'srcProc': {
          'port1': {
            packet: {id: 'packet1', timestamp: 1},
          }
        }
      },
      wires: {
        'srcProc:port1 -> destProc:port1': {
          src: {procId: 'srcProc', portId: 'port1'},
          dest: {procId: 'destProc', portId: 'port1'},
        }
      }
    }
    const prevInputs = {
      'destProc': {
        'port1': {
          packet: {
            ...state.outputs['srcProc']['port1'].packet,
            timestamp: (state.outputs['srcProc']['port1'].packet.timestamp - 1),
          }
        }
      }
    }
    const actual = selectors.inputs(state, {prevInputs})
    const expected = {
      'destProc': {
        'port1': {
          isFresh: true,
          packet: state.outputs['srcProc']['port1'].packet
        }
      }
    }
    assert.deepEqual(actual, expected)
  })

  it('incoming -> same age', () => {
    const state = {
      outputs: {
        'srcProc': {
          'port1': {
            packet: {id: 'packet1', timestamp: 1},
          }
        }
      },
      wires: {
        'srcProc:port1 -> destProc:port1': {
          src: {procId: 'srcProc', portId: 'port1'},
          dest: {procId: 'destProc', portId: 'port1'},
        }
      }
    }
    const prevInputs = {
      'destProc': {
        'port1': {
          packet: {
            id: 'somePacketId',
            timestamp: state.outputs['srcProc']['port1'].packet.timestamp,
          }
        }
      }
    }
    const actual = selectors.inputs(state, {prevInputs})
    const expected = {
      'destProc': {
        'port1': {
          isFresh: false,
          packet: prevInputs['destProc']['port1'].packet
        }
      }
    }
    assert.deepEqual(actual, expected)
  })
})

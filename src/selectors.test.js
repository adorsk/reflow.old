import { assert } from 'chai'

import selectors from './selectors.js'

describe('selectors.inputs', () => {

  it('incoming -> undefined', () => {
    const state = {
      outputs: {
        'srcProc': {
          'port1': {
            packet: {id: 'packet1', idx: 1},
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
            packet: {id: 'packet1', idx: 1},
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
            idx: (state.outputs['srcProc']['port1'].packet.idx - 1),
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

  it('incoming -> fresh same age', () => {
    const state = {
      outputs: {
        'srcProc': {
          'port1': {
            packet: {id: 'packet1', idx: 1},
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
          isFresh: true,
          packet: {
            id: 'somePacketId',
            idx: state.outputs['srcProc']['port1'].packet.idx,
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

  it('incoming -> stale same age', () => {
    const state = {
      outputs: {
        'srcProc': {
          'port1': {
            packet: {id: 'packet1', idx: 1},
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
          isFresh: false,
          packet: {
            id: 'somePacketId',
            idx: state.outputs['srcProc']['port1'].packet.idx,
          }
        }
      }
    }
    const actual = selectors.inputs(state, {prevInputs})
    assert.equal(actual['destProc']['port1'], prevInputs['destProc']['port1'])
  })

  it('takes newest from multiple incoming', () => {
    const state = {
      outputs: {
        'srcProc1': {
          'port1': {
            packet: {id: 'packet1', idx: 1},
          }
        },
        'srcProc2': {
          'port1': {
            packet: {id: 'packet1', idx: 2},
          }
        }
      },
      wires: {
        'srcProc1:port1 -> destProc:port1': {
          src: {procId: 'srcProc1', portId: 'port1'},
          dest: {procId: 'destProc', portId: 'port1'},
        },
        'srcProc2:port1 -> destProc:port1': {
          src: {procId: 'srcProc2', portId: 'port1'},
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
          packet: state.outputs['srcProc2']['port1'].packet
        }
      }
    }
    assert.deepEqual(actual, expected)
  })

  it('does not propagate inactive inputs', () => {
    const state = {
      outputs: {},
      wires: {}
    }
    const prevInputs = {
      'srcProc1': {
        'port1': {packet: {id: 'packet1', idx: 1}}
      }
    }
    const actual = selectors.inputs(state, {prevInputs})
    const expected = {'srcProc1': {}}
    assert.deepEqual(actual, expected)
  })
})

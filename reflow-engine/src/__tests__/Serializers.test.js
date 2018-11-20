/* global describe, it */
import { assert } from 'chai'
import _ from 'lodash'

import { ProgramEngineSerializer } from '../Serializers.js'
import ProgramEngine from '../ProgramEngine.js'
import ComponentLibrary from '../ComponentLibrary.js'
import * as constants from '../constants.js'

describe('ProgramEngineSerializer', () => {
  const getFixtures = async () => {
    const fixtures = {}
    fixtures.components = {
      'A': {
        serializeState: (state) => ({'A': state}),
        deserializeState: (state) => state['A']
      },
      'B': {}
    }
    fixtures.componentLibrary = new ComponentLibrary()
    _.each(fixtures.components, (component, key) => {
      fixtures.componentLibrary.set({key, value: component})
    })
    fixtures.progEng = await (async function createProgramEngine () {
      const progEng = new ProgramEngine({
        componentLibrary: fixtures.componentLibrary
      })
      progEng.tickCount = 42
      progEng.packetCount = 4242
      progEng.prevInputsByProcId = {
        'proc1': {
          'in1': {
            packetType: constants.PacketTypes.DATA,
            data: 'prevInputs.proc1.in1.data',
          },
          'in2': {
            packetType: constants.PacketTypes.DATA,
            data: 'prevInputs.proc1.in2.data',
          },
        },
        'proc2': {
          'in1': {
            packetType: constants.PacketTypes.DATA,
            data: 'prevInputs.proc2.in1.data',
          }
        }
      }
      await progEng.addProc({
        id: 'proc1',
        componentId: 'A',
        state: {k1: 'v1', k2: 'v2'},
        outputs: {
          out1: {
            packetType: constants.PacketTypes.DATA,
            data: 'proc1.out1.data',
          },
          out2: {
            packetType: constants.PacketTypes.DATA,
            data: 'proc1.out2.data',
          },
          out3: { packetType: constants.PacketTypes.OPEN },
        }
      })
      await progEng.addProc({
        id: 'proc2',
        componentId: 'B',
        state: {k1: 'v1', k2: 'v2'},
        outputs: {
          out1: {
            packetType: constants.PacketTypes.DATA,
            data: 'proc2.out1.data',
          }
        }
      })
      progEng.addWire({
        src: {procId: 'proc1', portId: 'out1'},
        dest: {procId: 'proc2', portId: 'in1'},
      })
      progEng.addWire({
        src: {procId: 'proc1', portId: 'out2'},
        dest: {procId: 'proc2', portId: 'in2'},
      })
      return progEng
    })()
    fixtures.serialization = {
      program: {
        id: 'mainProgram'
      },
      tickCount: 42,
      packetCount: 4242,
      prevInputsByProcId: {
        'proc1': {
          'in1': {
            packetType: constants.PacketTypes.DATA,
            data: 'prevInputs.proc1.in1.data',
          },
          'in2': {
            packetType: constants.PacketTypes.DATA,
            data: 'prevInputs.proc1.in2.data',
          },
        },
        'proc2': {
          'in1': {
            packetType: constants.PacketTypes.DATA,
            data: 'prevInputs.proc2.in1.data',
          }
        }
      },
      procs: {
        [constants.rootProcId]: {
          "id": "@ROOT",
          "outputs": {},
          "state": {},
          "hidden": true,
          "status": "RESOLVED",
        },
        'proc1': {
          id: 'proc1',
          componentId: 'A',
          state: {'A': {k1: 'v1', k2: 'v2'}},
          outputs: {
            out1: {
              packetType: constants.PacketTypes.DATA,
              data: 'proc1.out1.data',
            },
            out2: {
              packetType: constants.PacketTypes.DATA,
              data: 'proc1.out2.data',
            },
            out3: { packetType: constants.PacketTypes.OPEN },
          }
        },
        'proc2': {
          id: 'proc2',
          componentId: 'B',
          state: {k1: 'v1', k2: 'v2'},
          outputs: {
            out1: {
              packetType: constants.PacketTypes.DATA,
              data: 'proc2.out1.data',
            }
          }
        }
      },
      wires: {
        'proc1:out1 -> proc2:in1': {
          id: 'proc1:out1 -> proc2:in1',
          src: {procId: 'proc1', portId: 'out1'},
          dest: {procId: 'proc2', portId: 'in1'},
        },
        'proc1:out2 -> proc2:in2': {
          id: 'proc1:out2 -> proc2:in2',
          src: {procId: 'proc1', portId: 'out2'},
          dest: {procId: 'proc2', portId: 'in2'},
        }
      }
    }
    return fixtures
  }

  it('serializes', async () => {
    const fixtures = await getFixtures()
    const serializer = new ProgramEngineSerializer()
    const serialization = serializer.serialize(fixtures.progEng)
    assert.deepEqual(serialization, fixtures.serialization)
  })

  it('deserializes', async () => {
    const fixtures = await getFixtures()
    const serializer = new ProgramEngineSerializer()
    const progEng = await serializer.deserialize({
      serialization: fixtures.serialization,
      componentLibrary: fixtures.componentLibrary,
    })
    assert.equal(progEng.tickCount, fixtures.progEng.tickCount)
    assert.equal(progEng.packetCount, fixtures.progEng.packetCount)
    assert.deepEqual(progEng.prevInputsByProcId, fixtures.progEng.prevInputsByProcId)
    assert.deepEqual(progEng.getProcs(), fixtures.progEng.getProcs())
    assert.deepEqual(progEng.getWires(), fixtures.progEng.getWires())
  })
})

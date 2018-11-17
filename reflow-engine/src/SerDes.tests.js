import { assert } from 'chai'
import _ from 'lodash'

import SerDes from './SerDes.js'
import ProgramEngine from './ProgramEngine.js'
import * as constants from './constants.js'

describe('SerDes', () => {
  describe('serializeProgramEngine', () => {
    it('serializes', async () => {
      const progEng = await (async function createProgramEngine() {
        const progEng = new ProgramEngine()
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
              dataType: 'dataType1',
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
        const components = {
          'A': { serializeState: (state) => ({'A': state})},
          'B': {}
        }
        _.each(components, (component, key) => {
          progEng.componentLibrary.set({key, value: component})
        })
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
              dataType: 'dataType1',
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
      const serDes = new SerDes()
      serDes.registerSerDesForDataType({
        dataType: 'dataType1',
        serDes: {
          serialize: (data) => ({'dataType1': data})
        }
      })
      const actualSerialization = serDes.serializeProgramEngine(progEng)
      const expectedSerialization = {
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
              dataType: 'dataType1',
              data: {'dataType1': 'prevInputs.proc1.in2.data'},
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
                dataType: 'dataType1',
                data: {'dataType1': 'proc1.out2.data'},
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
      assert.deepEqual(actualSerialization, expectedSerialization)
    })
  })
})
